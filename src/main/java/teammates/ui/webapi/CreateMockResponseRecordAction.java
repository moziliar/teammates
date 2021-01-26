package teammates.ui.webapi;

import teammates.common.exception.EntityAlreadyExistsException;
import teammates.common.exception.InvalidParametersException;

public class CreateMockResponseRecordAction extends AdminOnlyAction {

    @Override
    JsonResult execute() {
        try {
            logic.createFeedbackResponseRecord(
                    logic.getTotalFeedBackResponseCount(), System.currentTimeMillis());
        } catch (InvalidParametersException | EntityAlreadyExistsException e) {
            return new JsonResult(e.getMessage());
        }
        return new JsonResult("Success");
    }

}
