# dev/backend/utils/error_handlers.py
from flask import jsonify

def register_error_handlers(app):

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": {
                "code": 400,
                "message": "Bad Request"
            }
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "error": {
                "code": 401,
                "message": "Unauthorized"
            }
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "error": {
                "code": 403,
                "message": "Forbidden"
            }
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": {
                "code": 404,
                "message": "Resource Not Found"
            }
        }), 404

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({
            "error": {
                "code": 409,
                "message": "Conflict"
            }
        }), 409

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            "error": {
                "code": 422,
                "message": "Unprocessable Entity"
            }
        }), 422

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": {
                "code": 500,
                "message": "Internal Server Error"
            }
        }), 500
