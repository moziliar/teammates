package teammates.logic.core;

import org.testng.annotations.Test;

/**
 * SUT: {@link FeedbackResponseRecordLogic}.
 */
public class FeedbackResponseRecordLogicTest extends BaseLogicTest {
    private final FeedbackResponseRecordLogic feedbackResponseRecordLogic =
            FeedbackResponseRecordLogic.inst();

    @Test
    public void testInitialization() {
        assertNotNull(FeedbackResponseRecordLogic.inst());
    }

    @Test
    public void testPurgerResponseRecords() {
        feedbackResponseRecordLogic.purgeFeedbackResponseRecord();
        assertEquals(
                feedbackResponseRecordLogic.getFeedbackResponseRecords(System.currentTimeMillis(), 1).size(),
                0);
    }
}
