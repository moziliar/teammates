package teammates.logic.core;

import org.testng.annotations.Test;

/**
 * SUT: {@link FeedbackResponseRecordLogic}.
 */
public class FeedbackResponseRecordLogicTest extends BaseLogicTest {

    @Test
    public void testInitialization() {
        assertNotNull(FeedbackResponseRecordLogic.inst());
    }

    @Test
    public void testPurgerResponseRecords() {
        FeedbackResponseRecordLogic feedbackResponseRecordLogic =
                FeedbackResponseRecordLogic.inst();
        feedbackResponseRecordLogic.purgeFeedbackResponseRecord();
        assertEquals(feedbackResponseRecordLogic.getFeedbackResponseRecords(System.currentTimeMillis(),
                1).size(), 0);
    }
}
