import sqlglot
from sqlglot import exp


def validate_sql(query: str) -> bool:
    try:
        statements = sqlglot.parse(query, read="postgres")

        if len(statements) != 1 or statements[0] is None:
            return False

        tree = statements[0]

        # Allow only SELECT queries
        if not isinstance(tree, exp.Select):
            return False

        return True

    except Exception:
        return False