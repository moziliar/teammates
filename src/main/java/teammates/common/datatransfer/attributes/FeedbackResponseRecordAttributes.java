package teammates.common.datatransfer.attributes;

import java.util.ArrayList;
import java.util.List;

import org.bouncycastle.util.Strings;

import teammates.common.util.Logger;
import teammates.storage.entity.FeedbackResponseRecord;

public class FeedbackResponseRecordAttributes extends EntityAttributes<FeedbackResponseRecord> {

    private static final Logger log = Logger.getLogger();

    private long count;
    private long timestamp;

    public FeedbackResponseRecordAttributes(long count, long timestamp) {
        this.count = count;
        this.timestamp = timestamp;
    }

    @Override
    public List<String> getInvalidityInfo() {
        return new ArrayList<>();
    }

    @Override
    public FeedbackResponseRecord toEntity() {
        return new FeedbackResponseRecord(this.generateEntityKey());
    }

    public static FeedbackResponseRecordAttributes valueOf(FeedbackResponseRecord record) {
        // TODO: error handling for cases where length of keyParts < 2 and the try catch
        String[] keyParts = Strings.split(record.getKey(), '-');

        long count;
        long timestamp;

        try {
            timestamp = Long.parseLong(keyParts[0]);
            count = Long.parseLong(keyParts[1]);
        } catch (NumberFormatException e) {
            log.warning("key '" + record.getKey() + "' corrupted");

            return null;
        }

        return new FeedbackResponseRecordAttributes(count, timestamp);
    }

    public String generateEntityKey() {
        return timestamp + "-" + count;
    }

    @Override
    public void sanitizeForSaving() {
        // no additional sanitization required
    }

    public long getCount() {
        return this.count;
    }

    public long getTimestamp() {
        return this.timestamp;
    }

}
