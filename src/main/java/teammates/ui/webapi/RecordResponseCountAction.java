package teammates.ui.webapi;

import teammates.common.exception.EntityAlreadyExistsException;
import teammates.common.exception.InvalidParametersException;
import teammates.common.util.Logger;

/**
 * Cron job: record the total number of responses with timestamp.
 */
public class RecordResponseCountAction extends AdminOnlyAction {

    private static final Logger log = Logger.getLogger();

    @Override
    ActionResult execute() {
        try {
            logic.createFeedbackResponseRecord(
                    logic.getTotalFeedBackResponseCount(), System.currentTimeMillis());
        } catch (InvalidParametersException | EntityAlreadyExistsException e) {
            log.warning("record feedback response failed " + e.getMessage());

            return new JsonResult("Failed");
        }

        return new JsonResult("Successful");
    }
}
