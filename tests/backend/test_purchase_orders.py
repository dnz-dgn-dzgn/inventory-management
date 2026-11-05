"""
Tests for purchase order API endpoints (create and look up by backlog item).
"""
import pytest

import main


@pytest.fixture(autouse=True)
def reset_purchase_orders():
    """Purchase orders live in module memory; start every test with none."""
    main.purchase_orders.clear()
    yield
    main.purchase_orders.clear()


def valid_request(**overrides):
    """A valid purchase order request for backlog item 1."""
    body = {
        "backlog_item_id": "1",
        "supplier_name": "Acme Components",
        "quantity": 350,
        "unit_cost": 8.9,
        "expected_delivery_date": "2026-12-01",
        "notes": "Rush order",
    }
    body.update(overrides)
    return body


class TestCreatePurchaseOrder:
    """Test suite for creating purchase orders."""

    def test_create_purchase_order(self, client):
        """Test creating a purchase order returns 201 and the stored order."""
        response = client.post("/api/purchase-orders", json=valid_request())
        assert response.status_code == 201

        data = response.json()
        assert data["id"] == "PO-0001"
        assert data["backlog_item_id"] == "1"
        assert data["supplier_name"] == "Acme Components"
        assert data["quantity"] == 350
        assert data["unit_cost"] == 8.9
        assert data["expected_delivery_date"] == "2026-12-01"
        assert data["status"] == "Pending"
        assert data["notes"] == "Rush order"
        assert "created_date" in data

    def test_notes_are_optional(self, client):
        """Test that notes can be left out."""
        body = valid_request()
        del body["notes"]
        response = client.post("/api/purchase-orders", json=body)
        assert response.status_code == 201
        assert response.json()["notes"] is None

    def test_ids_increase(self, client):
        """Test that each new order gets the next id."""
        first = client.post("/api/purchase-orders", json=valid_request(backlog_item_id="1"))
        second = client.post("/api/purchase-orders", json=valid_request(backlog_item_id="2"))
        assert first.json()["id"] == "PO-0001"
        assert second.json()["id"] == "PO-0002"

    def test_unknown_backlog_item_returns_404(self, client):
        """Test that an unknown backlog item is rejected."""
        response = client.post("/api/purchase-orders", json=valid_request(backlog_item_id="999"))
        assert response.status_code == 404

    def test_second_order_for_same_item_returns_409(self, client):
        """Test that a backlog item can only have one purchase order."""
        assert client.post("/api/purchase-orders", json=valid_request()).status_code == 201
        response = client.post("/api/purchase-orders", json=valid_request())
        assert response.status_code == 409
        assert len(main.purchase_orders) == 1

    @pytest.mark.parametrize("field,value", [
        ("quantity", 0),
        ("quantity", -5),
        ("unit_cost", 0),
        ("unit_cost", -1.5),
        ("supplier_name", ""),
    ])
    def test_invalid_values_return_422(self, client, field, value):
        """Test that non-positive numbers and an empty supplier are rejected."""
        response = client.post("/api/purchase-orders", json=valid_request(**{field: value}))
        assert response.status_code == 422
        assert main.purchase_orders == []

    def test_missing_field_returns_422(self, client):
        """Test that a missing required field is rejected."""
        body = valid_request()
        del body["supplier_name"]
        response = client.post("/api/purchase-orders", json=body)
        assert response.status_code == 422

    @pytest.mark.parametrize("date", ["01.12.2026", "2026-13-40", "tomorrow", ""])
    def test_invalid_delivery_date_returns_400(self, client, date):
        """Test that the delivery date must be a real YYYY-MM-DD date."""
        response = client.post("/api/purchase-orders", json=valid_request(expected_delivery_date=date))
        assert response.status_code == 400
        assert main.purchase_orders == []


class TestGetPurchaseOrder:
    """Test suite for looking up a purchase order by backlog item."""

    def test_get_existing_purchase_order(self, client):
        """Test that a created order can be fetched by its backlog item id."""
        created = client.post("/api/purchase-orders", json=valid_request()).json()
        response = client.get("/api/purchase-orders/1")
        assert response.status_code == 200
        assert response.json() == created

    def test_get_missing_purchase_order_returns_404(self, client):
        """Test that an item without an order returns 404."""
        response = client.get("/api/purchase-orders/1")
        assert response.status_code == 404


class TestBacklogPurchaseOrderFields:
    """Test that the backlog endpoint reports the purchase order state."""

    def test_backlog_without_orders(self, client):
        """Test that no item has an order at the start."""
        items = client.get("/api/backlog").json()
        assert len(items) > 0
        assert all(item["has_purchase_order"] is False for item in items)
        assert all(item["purchase_order_id"] is None for item in items)

    def test_backlog_reports_created_order(self, client):
        """Test that only the item with an order is flagged, with its id."""
        po = client.post("/api/purchase-orders", json=valid_request(backlog_item_id="2")).json()
        items = {item["id"]: item for item in client.get("/api/backlog").json()}
        assert items["2"]["has_purchase_order"] is True
        assert items["2"]["purchase_order_id"] == po["id"]
        assert items["1"]["has_purchase_order"] is False
        assert items["1"]["purchase_order_id"] is None
