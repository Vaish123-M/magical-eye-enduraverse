"""GraphQL API route using Strawberry."""
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema

# GraphQLRouter already owns the /graphql and /graphql/websocket paths.
# Nesting it in an empty-path APIRouter breaks on current FastAPI versions.
router = GraphQLRouter(schema, path="/graphql")
