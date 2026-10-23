from pydantic import BaseModel, SecretStr

class DatabaseConnectionRequest(BaseModel):
    connection_url: SecretStr