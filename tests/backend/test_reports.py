"""
Tests for report API endpoints (quarterly performance and monthly trends).
"""
import pytest


class TestQuarterlyReports:
    """Test suite for the quarterly report endpoint."""

    def test_get_quarterly_reports(self, client):
        """Test getting the quarterly report without filters."""
        response = client.get("/api/reports/quarterly")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        quarter = data[0]
        for field in ("quarter", "total_orders", "total_revenue",
                      "avg_order_value", "fulfillment_rate"):
            assert field in quarter

    def test_unfiltered_totals_match_all_orders(self, client):
        """Test that without filters every order is counted."""
        all_orders = client.get("/api/orders").json()
        data = client.get("/api/reports/quarterly").json()
        assert sum(q["total_orders"] for q in data) == len(all_orders)

    def test_warehouse_filter_matches_orders_endpoint(self, client):
        """Test that the warehouse filter counts the same orders as /api/orders."""
        expected = client.get("/api/orders?warehouse=Tokyo").json()
        data = client.get("/api/reports/quarterly?warehouse=Tokyo").json()
        assert 0 < len(expected) < len(client.get("/api/orders").json())
        assert sum(q["total_orders"] for q in data) == len(expected)

    def test_category_filter_matches_orders_endpoint(self, client):
        """Test that the category filter counts the same orders as /api/orders."""
        expected = client.get("/api/orders?category=Sensors").json()
        data = client.get("/api/reports/quarterly?category=Sensors").json()
        assert sum(q["total_orders"] for q in data) == len(expected)

    def test_status_filter_matches_orders_endpoint(self, client):
        """Test that the status filter counts the same orders as /api/orders."""
        expected = client.get("/api/orders?status=Delivered").json()
        data = client.get("/api/reports/quarterly?status=Delivered").json()
        assert sum(q["total_orders"] for q in data) == len(expected)
        # Every counted order is delivered, so the fulfillment rate is 100
        assert all(q["fulfillment_rate"] == 100 for q in data)

    def test_month_filter_limits_quarters(self, client):
        """Test that a single month leaves only the quarter containing it."""
        data = client.get("/api/reports/quarterly?month=2025-01").json()
        assert [q["quarter"] for q in data] == ["Q1-2025"]

    def test_all_value_means_no_filter(self, client):
        """Test that 'all' behaves like no filter."""
        plain = client.get("/api/reports/quarterly").json()
        with_all = client.get(
            "/api/reports/quarterly?warehouse=all&category=all&status=all&month=all"
        ).json()
        assert plain == with_all

    def test_filter_without_matches_returns_empty_list(self, client):
        """Test that a filter without matching orders returns an empty list."""
        response = client.get("/api/reports/quarterly?warehouse=Atlantis")
        assert response.status_code == 200
        assert response.json() == []


class TestMonthlyTrends:
    """Test suite for the monthly trends endpoint."""

    def test_get_monthly_trends(self, client):
        """Test getting monthly trends without filters."""
        response = client.get("/api/reports/monthly-trends")
        assert response.status_code == 200

        data = response.json()
        assert len(data) > 0
        for field in ("month", "order_count", "revenue", "delivered_count"):
            assert field in data[0]

    def test_months_are_sorted(self, client):
        """Test that months come back in ascending order."""
        months = [m["month"] for m in client.get("/api/reports/monthly-trends").json()]
        assert months == sorted(months)

    def test_unfiltered_totals_match_all_orders(self, client):
        """Test that without filters every order is counted."""
        all_orders = client.get("/api/orders").json()
        data = client.get("/api/reports/monthly-trends").json()
        assert sum(m["order_count"] for m in data) == len(all_orders)

    def test_warehouse_filter_matches_orders_endpoint(self, client):
        """Test that the warehouse filter counts the same orders as /api/orders."""
        expected = client.get("/api/orders?warehouse=London").json()
        data = client.get("/api/reports/monthly-trends?warehouse=London").json()
        assert sum(m["order_count"] for m in data) == len(expected)

    def test_month_filter_returns_that_month_only(self, client):
        """Test that a single month returns only that month."""
        data = client.get("/api/reports/monthly-trends?month=2025-03").json()
        assert [m["month"] for m in data] == ["2025-03"]

    def test_revenue_matches_orders_endpoint(self, client):
        """Test that filtered revenue equals the sum of the filtered orders."""
        expected = sum(o["total_value"] for o in client.get("/api/orders?category=Actuators").json())
        data = client.get("/api/reports/monthly-trends?category=Actuators").json()
        assert sum(m["revenue"] for m in data) == pytest.approx(expected)
