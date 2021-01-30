package teammates.storage.api;

import java.util.Arrays;
import java.util.List;

import org.testng.annotations.Test;

import teammates.common.datatransfer.attributes.FeedbackResponseRecordAttributes;
import teammates.common.exception.EntityAlreadyExistsException;
import teammates.common.exception.InvalidParametersException;
import teammates.test.BaseComponentTestCase;

/**
 * SUT: {@link FeedbackResponseMonitorDb}.
 */
public class FeedbackResponseMonitorDbTest extends BaseComponentTestCase {
    FeedbackResponseMonitorDb db = new FeedbackResponseMonitorDb();
    final long currentTime = System.currentTimeMillis();
    List<Long> countTestData = Arrays.asList(105L, 105L, 105L, 105L, 105L);

    private void populateTestData() throws EntityAlreadyExistsException, InvalidParametersException {
        for (int i = 0; i < countTestData.size(); i++) {
            long timestamp = currentTime - 120 * i;
            db.createEntity(new FeedbackResponseRecordAttributes(countTestData.get(i), timestamp));
        }
    }

    @Test
    public void testResponseRecordsInterval() throws EntityAlreadyExistsException, InvalidParametersException {
        long interval = 120;

        db.purgeResponseRecords();
        populateTestData();

        //get all records with interval 120 milliseconds
        List<FeedbackResponseRecordAttributes> results =
                db.getResponseRecords(currentTime, interval);
        long localCurrentTime = -1;
        for (FeedbackResponseRecordAttributes attributes : results) {
            if (localCurrentTime != -1) {
                //validate interval
                assertEquals(attributes.getTimestamp() - localCurrentTime, 120);
            }
            localCurrentTime = attributes.getTimestamp();
        }
    }

    @Test
    public void testResponseRecordsDuration() throws EntityAlreadyExistsException, InvalidParametersException {
        long duration = 400;

        db.purgeResponseRecords();
        populateTestData();

        //get all records with interval 240 milliseconds
        List<FeedbackResponseRecordAttributes> results =
                db.getResponseRecords(duration, 240);
        if (results.isEmpty()) {
            return;
        }
        assertTrue(currentTime - results.get(0).getTimestamp() <= duration);
    }
}
