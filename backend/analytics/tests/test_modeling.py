import app.modeling as modeling


def test_modeling_exports() -> None:
    expected = {
        "ColumnTransformer",
        "ElasticNet",
        "HistGradientBoostingRegressor",
        "Pipeline",
        "RandomForestRegressor",
        "Ridge",
    }
    assert set(modeling.__all__) == expected
