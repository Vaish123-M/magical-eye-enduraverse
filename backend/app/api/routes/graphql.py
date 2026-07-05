"""GraphQL API route using Strawberry."""
from fastapi import APIRouter
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema

graphql_router = GraphQLRouter(schema)

router = APIRouter(prefix="/graphql", tags=["GraphQL"])
router.include_router(graphql_router)
