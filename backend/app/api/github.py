from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/github", tags=["GitHub Integration"])

class ConnectRepoRequest(BaseModel):
    repo_url: str
    branch: str = "main"
    access_token: str = ""

@router.get("/repositories")
def list_connected_repositories():
    return [
        {
            "id": 1,
            "name": "icream-shop-ecommerce",
            "full_name": "vulnscan-demo/icream-shop",
            "default_branch": "main",
            "private": False,
            "stars": 142,
            "updated_at": "2026-10-30T18:45:00Z"
        },
        {
            "id": 2,
            "name": "payment-gateway-service",
            "full_name": "vulnscan-demo/payment-gateway",
            "default_branch": "develop",
            "private": True,
            "stars": 18,
            "updated_at": "2026-10-29T12:30:00Z"
        }
    ]

@router.post("/connect")
def connect_repo(req: ConnectRepoRequest):
    return {
        "status": "connected",
        "repo_url": req.repo_url,
        "branch": req.branch,
        "webhook_url": "http://localhost:8000/api/cicd/evaluate"
    }

