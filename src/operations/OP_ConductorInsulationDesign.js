const { responseCodes } = require("../services/baseReponse");
const cableDesignAI = require("../services/cableDesignAI");

exports.generate = async function (body) {
    try {
        const design = await cableDesignAI.generateConductorInsulationDesign(body.data);
        responseCodes.SUCCESS.data = design;
        responseCodes.SUCCESS.message = "Design Generated Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = `Failed to Generate Design: ${e.message}`;
        return responseCodes.BAD_REQUEST;
    }
};
