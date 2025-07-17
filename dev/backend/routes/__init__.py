import logging
from flask import request

# Get the logger configured in app.py
logger = logging.getLogger("moosic_logger")


def log_request():
    """Log details of each incoming request."""
    try:
        log_data = {
            "method": request.method,
            "path": request.path,
            "query_params": request.args.to_dict(),
            "remote_addr": request.remote_addr,
            "headers": request.headers
        }

        # For POST/PUT, log body if it's JSON (mask sensitive fields)
        # if request.method in ["POST", "PUT"] and request.is_json:
        #     body = request.get_json()
        #     sensitive_fields = ["password", "token", "client_secret"]  # Custom sensitive fields
        #     for field in sensitive_fields:
        #         if field in body:
        #             body[field] = "********"
        #     log_data["body"] = body

        logger.info(f"Incoming request: {log_data}")
    except Exception as e:
        logger.error(f"Failed to log request: {str(e)}")
