package teammates.storage.api;

import java.util.ArrayList;
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
    List<Long> countTestData = new ArrayList<>(Arrays.asList(105L, 105L, 105L, 105L, 105L));

    private void populateTestData() throws EntityAlreadyExistsException, InvalidParametersException {
        for (int i = 0; i < countTestData.size(); i++) {
            FeedbackResponseRecordAttributes attributes =
                    new FeedbackResponseRecordAttributes(countTestData.get(i), currentTime - 120 * i);
            db.createEntity(attributes);
        }
    }

    @Test
    public void testResponseRecordsInterval() throws EntityAlreadyExistsException, InvalidParametersException {
        long interval = 120;

        db.purgeResponseRecords();
        populateTestData();

        //get all records with interval 120 milliseconds
        List<FeedbackResponseRecordAttributes> results =
                db.getResponseRecords(this.currentTime, interval);
        long currentTime = -1;
        for (FeedbackResponseRecordAttributes attributes : results) {
            if (currentTime != -1) {
                continue;
            }
            //validate interval
            assertEquals(attributes.getTimestamp() - currentTime, 120);
            currentTime = attributes.getTimestamp();
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
