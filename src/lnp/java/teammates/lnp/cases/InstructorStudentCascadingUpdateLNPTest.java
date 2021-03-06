package teammates.lnp.cases;

import java.io.IOException;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.jmeter.protocol.http.control.HeaderManager;
import org.apache.jorphan.collections.HashTree;
import org.apache.jorphan.collections.ListedHashTree;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import teammates.common.datatransfer.DataBundle;
import teammates.common.datatransfer.InstructorPrivileges;
import teammates.common.datatransfer.attributes.*;
import teammates.common.datatransfer.questions.FeedbackTextResponseDetails;
import teammates.common.util.Const;
import teammates.common.util.JsonUtils;
import teammates.lnp.util.JMeterElements;
import teammates.lnp.util.LNPSpecification;
import teammates.lnp.util.LNPTestData;
import teammates.ui.request.StudentsEnrollRequest;

public class InstructorStudentCascadingUpdateLNPTest extends BaseLNPTestCase {
    private static final int NUM_INSTRUCTORS = 1;
    private static final int RAMP_UP_PERIOD = NUM_INSTRUCTORS * 2;

    private static final int NUM_STUDENTS = 1600;
    private static final int NUM_STUDENTS_PER_SECTION = 100;
    private static final int NUMBER_OF_FEEDBACK_QUESTIONS = 20;

    private static final String INSTRUCTOR_NAME = "tmms.test";
    private static final String INSTRUCTOR_EMAIL = "tmms.test";
    private static final String COURSE_NAME = "LnPCourse";
    private static final String COURSE_ID = "TestData.CS101";

    private static final String STUDENT_NAME_PREFIX = "LnPStudent";
    private static final String STUDENT_ID_PREFIX = "LnPStudent.tmms";
    private static final String STUDENT_EMAIL_SUBFIX = "@gmail.tmt";

    private static final String FEEDBACK_RESPONSE_PREFIX = "LnPResponse";
    private static final String FEEDBACK_SESSION_NAME = "LnPSession";

    private static final double ERROR_RATE_LIMIT = 0.01;
    private static final double MEAN_RESP_TIME_LIMIT = 50000;

    @Override
    protected LNPTestData getTestData() {
        return new LNPTestData() {
            @Override
            protected Map<String, AccountAttributes> generateAccounts() {
                return new HashMap<>();
            }

            @Override
            protected Map<String, CourseAttributes> generateCourses() {
                Map<String, CourseAttributes> courses = new HashMap<>();

                courses.put(COURSE_NAME , CourseAttributes.builder(COURSE_NAME)
                        .withName(COURSE_NAME)
                        .withTimezone(ZoneId.of("UTC"))
                        .build()
                );

                return courses;
            }

            @Override
            protected Map<String, StudentAttributes> generateStudents() {
                Map<String, StudentAttributes> students = new HashMap<>();

                for (int i = 0; i < NUM_STUDENTS; i++) {
                    students.put(STUDENT_NAME_PREFIX + i, StudentAttributes.builder(COURSE_ID,
                            STUDENT_NAME_PREFIX + i + STUDENT_EMAIL_SUBFIX)
                            .withGoogleId(STUDENT_ID_PREFIX + i)
                            .withName(STUDENT_NAME_PREFIX + i)
                            .withComment("This student's name is " + STUDENT_NAME_PREFIX + i)
                            .withSectionName(String.valueOf(i / NUM_STUDENTS_PER_SECTION))
                            .withTeamName(String.valueOf(i / NUM_STUDENTS_PER_SECTION))
                            .build());
                }

                return students;
            }

            @Override
            protected Map<String, FeedbackResponseAttributes> generateFeedbackResponses() {
                Map<String, FeedbackResponseAttributes> feedbackResponses = new HashMap<>();

                for (int i = 1; i <= NUMBER_OF_FEEDBACK_QUESTIONS; i++) {
                    for (int j = 0; j <= NUM_STUDENTS; j++) {
                        String responseText = FEEDBACK_RESPONSE_PREFIX + " " + j;
                        FeedbackTextResponseDetails details =
                                new FeedbackTextResponseDetails(responseText);

                        feedbackResponses.put(responseText,
                                FeedbackResponseAttributes.builder(String.valueOf(i),
                                        STUDENT_ID_PREFIX + j,
                                        STUDENT_ID_PREFIX + j)
                                        .withCourseId(COURSE_ID)
                                        .withFeedbackSessionName(FEEDBACK_SESSION_NAME)
                                        .withGiverSection(String.valueOf(j / NUM_STUDENTS_PER_SECTION))
                                        .withRecipientSection(String.valueOf(j / NUM_STUDENTS_PER_SECTION))
                                        .withResponseDetails(details)
                                        .build());
                    }
                }

                return feedbackResponses;
            }

            @Override
            protected Map<String, FeedbackResponseCommentAttributes> generateFeedbackResponseComments() {
                Map<String, FeedbackResponseCommentAttributes> feedbackResponseComments = new HashMap<>();

                for (int i = 1; i <= NUMBER_OF_FEEDBACK_QUESTIONS; i++) {
                    for (int j = 0; j <= NUM_STUDENTS; j++) {
                        String responseText = "This is a comment " + j;

                        feedbackResponseComments.put(responseText,
                                FeedbackResponseCommentAttributes.builder()
                                        .withCourseId(COURSE_ID)
                                        .withFeedbackResponseId(String.valueOf(i))
                                        .withFeedbackSessionName(FEEDBACK_SESSION_NAME)
                                        .withGiverSection(String.valueOf(j / NUM_STUDENTS_PER_SECTION))
                                        .withCommentGiver(String.valueOf(j / NUM_STUDENTS_PER_SECTION))
                                        .withCommentText(responseText)
                                        .build());
                    }
                }

                return feedbackResponseComments;
            }

            @Override
            protected Map<String, InstructorAttributes> generateInstructors() {
                Map<String, InstructorAttributes> instructors = new HashMap<>();

                instructors.put(INSTRUCTOR_NAME,
                        InstructorAttributes.builder(COURSE_NAME, INSTRUCTOR_EMAIL + "@gmail.tmt")
                                .withGoogleId(INSTRUCTOR_NAME)
                                .withName(INSTRUCTOR_NAME)
                                .withRole("Co-owner")
                                .withIsDisplayedToStudents(true)
                                .withDisplayedName("Co-owner")
                                .withPrivileges(new InstructorPrivileges(
                                        Const.InstructorPermissionRoleNames.INSTRUCTOR_PERMISSION_ROLE_COOWNER))
                                .build()
                );

                return instructors;
            }

            @Override
            public List<String> generateCsvHeaders() {
                List<String> headers = new ArrayList<>();

                headers.add("loginId");
                headers.add("isAdmin");
                headers.add("courseId");
                headers.add("enrollData");

                return headers;
            }

            @Override
            public List<List<String>> generateCsvData() {
                DataBundle dataBundle = loadDataBundle(getJsonDataPath());
                List<List<String>> csvData = new ArrayList<>();

                dataBundle.instructors.forEach((key, instructor) -> {
                    List<String> csvRow = new ArrayList<>();

                    csvRow.add(instructor.googleId);
                    csvRow.add("yes");
                    csvRow.add(instructor.courseId);

                    // Create and add student enrollment data with a team number corresponding to each section number
                    List<StudentsEnrollRequest.StudentEnrollRequest> enrollRequests = new ArrayList<>();

                    for (int i = 0; i < NUM_STUDENTS; i++) {
                        String name = instructor.name + ".Student" + (NUM_STUDENTS - i);
                        String email = STUDENT_NAME_PREFIX + i + STUDENT_EMAIL_SUBFIX;
                        String team = String.valueOf((NUM_STUDENTS - i) / NUM_STUDENTS_PER_SECTION);
                        String section = String.valueOf((NUM_STUDENTS - i) / NUM_STUDENTS_PER_SECTION);
                        String comment = "no comment";

                        enrollRequests.add(
                                new StudentsEnrollRequest.StudentEnrollRequest(name, email, team, section, comment));
                    }
                    String enrollData = sanitizeForCsv(JsonUtils.toJson(new StudentsEnrollRequest(enrollRequests)));
                    csvRow.add(enrollData);

                    csvData.add(csvRow);
                });

                return csvData;
            }
        };
    }

    private Map<String, String> getRequestHeaders() {
        Map<String, String> headers = new HashMap<>();

        headers.put("X-CSRF-TOKEN", "${csrfToken}");
        headers.put("Content-Type", "text/csv");

        return headers;
    }

    private String getTestEndpoint() {
        return Const.ResourceURIs.STUDENTS + "?courseid=${courseId}";
    }

    @Override
    protected ListedHashTree getLnpTestPlan() {
        ListedHashTree testPlan = new ListedHashTree(JMeterElements.testPlan());
        HashTree threadGroup = testPlan.add(
                JMeterElements.threadGroup(NUM_INSTRUCTORS, RAMP_UP_PERIOD, 1));

        threadGroup.add(JMeterElements.csvDataSet(getPathToTestDataFile(getCsvConfigPath())));
        threadGroup.add(JMeterElements.cookieManager());
        threadGroup.add(JMeterElements.defaultSampler());

        threadGroup.add(JMeterElements.onceOnlyController())
                .add(JMeterElements.loginSampler())
                .add(JMeterElements.csrfExtractor("csrfToken"));

        // Add HTTP sampler for test endpoint
        HeaderManager headerManager = JMeterElements.headerManager(getRequestHeaders());
        threadGroup.add(JMeterElements.httpSampler(getTestEndpoint(), PUT, "${enrollData}"))
                .add(headerManager);

        return testPlan;
    }

    @Override
    protected void setupSpecification() {
        this.specification = LNPSpecification.builder()
                .withErrorRateLimit(ERROR_RATE_LIMIT)
                .withMeanRespTimeLimit(MEAN_RESP_TIME_LIMIT)
                .build();
    }

    @BeforeClass
    public void classSetup() {
        generateTimeStamp();
        createTestData();
        setupSpecification();
    }

    @Test
    public void runLnpTest() throws IOException {
        runJmeter(false);
        displayLnpResults();
    }

    /**
     * Removes the entities added for the instructors' student enrollment L&P test.
     */
    @AfterClass
    public void classTearDown() throws IOException {
        // There is no need to add the newly enrolled students to the JSON DataBundle#students. This is because the new
        // CourseStudent entities that were created are automatically deleted when the corresponding course is deleted.
        deleteTestData();
        deleteDataFiles();
        cleanupResults();
    }
}