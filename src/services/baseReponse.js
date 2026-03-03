const responseCodes = {
	INTERNAL_SERVER_ERROR: { status: 500, code: '101', message: 'INTERNAL_SERVER_ERROR' },
	NOT_FOUND: { status: 404, code: '101', message: 'NOT_FOUND' },
	UNAUTHORIZED: { status: 401, code: '101', message: 'UNAUTHORIZED' },
	BAD_REQUEST: { status: 400, code: '101', message: 'BAD_REQUEST' },
	RESPONSE_NULL: { status: 200, code: '101', message: 'RESPONSE_NULL' },
	SUCCESS: { status: 200, code: '100', message: 'SUCCESS' }
};
exports.responseCodes = responseCodes;
