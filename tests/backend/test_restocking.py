"""
Tests for restocking API endpoints (recommendations and submitted orders).
"""
import pytest

import main


@pytest.fixture(autouse=True)
def reset_restock_orders():
    """Submitted orders live in module memory; start every test with none."""
    main.restock_orders.clear()
    yield
    main.restock_orders.clear()


class TestRestockRecommendations:
    """Test suite for the budget-based recommendation endpoint."""

    def test_recommendations_structure(self, client):
        """Test the response structure for a normal budget."""
        response = client.get("/api/restocking/recommendations?budget=10000")
        assert response.status_code == 200

        data = response.json()
        assert data["budget"] == 10000
        assert isinstance(data["items"], list)
        assert len(data["items"]) > 0

        item = data["items"][0]
        for field in ("sku", "name", "trend", "needed", "quantity",
                      "unit_cost", "line_total", "lead_time_days"):
            assert field in item

    def test_zero_budget_recommends_nothing(self, client):
        """Test that a budget of zero returns no items."""
        response = client.get("/api/restocking/recommendations?budget=0")
        assert response.status_code == 200

        data = response.json()
        assert data["items"] == []
        assert data["total_cost"] == 0
        assert data["remaining"] == 0

    def test_total_never_exceeds_budget(self, client):
        """Test that the recommended total stays within the budget."""
        for budget in (50, 500, 5000, 50000, 5000000):
            data = client.get(f"/api/restocking/recommendations?budget={budget}").json()
            assert data["total_cost"] <= budget
            assert data["remaining"] >= 0
            assert data["total_cost"] + data["remaining"] == pytest.approx(budget)

    def test_total_matches_line_totals(self, client):
        """Test that the total equals the sum of the line totals."""
        data = client.get("/api/restocking/recommendations?budget=20000").json()
        assert data["total_cost"] == pytest.approx(
            sum(line["line_total"] for line in data["items"])
        )

    def test_quantity_never_exceeds_needed(self, client):
        """Test that no item is recommended beyond its forecasted shortfall."""
        data = client.get("/api/restocking/recommendations?budget=5000000").json()
        for line in data["items"]:
            assert 0 < line["quantity"] <= line["needed"]

    def test_decreasing_demand_is_not_recommended(self, client):
        """Test that items with falling demand are never recommended."""
        data = client.get("/api/restocking/recommendations?budget=5000000").json()
        assert all(line["trend"] != "decreasing" for line in data["items"])
        assert "MTR-304" not in [line["sku"] for line in data["items"]]

    def test_rising_demand_comes_first(self, client):
        """Test that rising demand is listed before stable demand."""
        data = client.get("/api/restocking/recommendations?budget=5000000").json()
        trends = [line["trend"] for line in data["items"]]
        assert trends == sorted(trends, key=lambda t: t != "increasing")

    def test_missing_budget_is_rejected(self, client):
        """Test that the budget parameter is required."""
        assert client.get("/api/restocking/recommendations").status_code == 422

    def test_negative_budget_is_rejected(self, client):
        """Test that a negative budget is rejected."""
        assert client.get("/api/restocking/recommendations?budget=-1").status_code == 422


class TestRestockOrders:
    """Test suite for submitting and listing restocking orders."""

    def test_no_orders_initially(self, client):
        """Test that the order list starts empty."""
        response = client.get("/api/restocking/orders")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_order(self, client):
        """Test submitting a restocking order."""
        response = client.post("/api/restocking/orders", json={
            "items": [{"sku": "FLT-405", "quantity": 100}],
        })
        assert response.status_code == 201

        order = response.json()
        assert order["id"] == "RST-0001"
        assert order["status"] == "Submitted"
        assert order["total_value"] == pytest.approx(100 * 8.90)
        assert order["lead_time_days"] == 3
        assert "expected_delivery" in order

    def test_lead_time_is_slowest_item(self, client):
        """Test that the order lead time is that of its slowest item."""
        order = client.post("/api/restocking/orders", json={
            "items": [
                {"sku": "FLT-405", "quantity": 10},
                {"sku": "CTL-330", "quantity": 1},
            ],
        }).json()
        assert order["lead_time_days"] == 10

    def test_created_order_appears_in_list_newest_first(self, client):
        """Test that submitted orders are listed, newest first."""
        client.post("/api/restocking/orders", json={"items": [{"sku": "FLT-405", "quantity": 1}]})
        client.post("/api/restocking/orders", json={"items": [{"sku": "WDG-001", "quantity": 1}]})

        orders = client.get("/api/restocking/orders").json()
        assert [o["id"] for o in orders] == ["RST-0002", "RST-0001"]

    def test_price_comes_from_server_not_client(self, client):
        """Test that a client-supplied price is ignored."""
        order = client.post("/api/restocking/orders", json={
            "items": [{"sku": "FLT-405", "quantity": 10, "unit_cost": 0.01}],
        }).json()
        assert order["items"][0]["unit_cost"] == 8.90

    def test_unknown_sku_is_rejected(self, client):
        """Test that an unknown SKU returns 400 and stores nothing."""
        response = client.post("/api/restocking/orders", json={
            "items": [{"sku": "NOPE-000", "quantity": 1}],
        })
        assert response.status_code == 400
        assert client.get("/api/restocking/orders").json() == []

    def test_invalid_quantity_is_rejected(self, client):
        """Test that zero and negative quantities are rejected."""
        for quantity in (0, -5):
            response = client.post("/api/restocking/orders", json={
                "items": [{"sku": "FLT-405", "quantity": quantity}],
            })
            assert response.status_code == 422

    def test_empty_order_is_rejected(self, client):
        """Test that an order without items is rejected."""
        assert client.post("/api/restocking/orders", json={"items": []}).status_code == 422
