import {
  ActionButton,
  Avatar,
  Box,
  Editor,
  FrameProvider,
  I18nProvider,
  Text,
  ThemeProvider,
} from "@baseline-ui/core";
import { themes } from "@baseline-ui/tokens";
import { Comment, type Instance, type List } from "@nutrient-sdk/viewer";
import React, { useEffect } from "react";

interface CommentThreadProps {
  instance: Instance | null;
  id: string;
}

const CommentThread = (props: CommentThreadProps) => {
  const { instance, id } = props;
  const [comments, setComments] = React.useState<null | List<Comment>>(null);
  // We only allow editing one comment at a time
  const [editCommentId, setEditCommentId] = React.useState<string | null>(null);

  useEffect(() => {
    const syncComments = () => {
      // getComments lets us fetch all comments
      instance?.getComments().then((initialComments) => {
        // Filter comments that belong to this thread using the id passed to the component via props
        const commentsInThread = initialComments.filter((c) => c.rootId === id);
        setComments(commentsInThread);
      });
    };

    syncComments();

    // Since comments can change due to various factors we add a listener to sync them
    instance?.addEventListener("comments.change", syncComments);

    return () => {
      // Cleanup the listener when the component unmounts
      instance?.removeEventListener("comments.change", syncComments);
    };
  }, [instance, id]);

  return (
    <ThemeProvider theme={themes.base.light}>
      <FrameProvider>
        <I18nProvider shouldLogMissingMessages={false} locale="en-US">
          <Box
            padding="md"
            backgroundColor="background.primary.subtle"
            borderRadius="sm"
            boxShadow="low"
            className="comment-thread-container"
          >
            <Text size="sm" type="label" className="comment-thread-counter">
              💬 Total comments: {comments?.size ?? 0}
            </Text>
            {comments?.map((comment) => (
              <div key={comment.id} className="comment-container">
                <div className="comment-creator">
                  <Avatar
                    name={comment.creatorName ?? "Anonymous"}
                    showInitials
                  />{" "}
                  <Text type="label" size="md">
                    {comment.creatorName ?? "Anonymous"}
                  </Text>
                </div>
                <div className="comment-date">
                  <Text type="helper" size="sm">
                    📅 Date: {comment.createdAt?.toLocaleString()}
                  </Text>
                </div>
                {editCommentId === comment.id ? (
                  <Editor
                    placeholder="Edit your comment"
                    autoFocus
                    clearOnSave
                    clearOnCancel
                    saveOnEnter
                    aria-label="Comment"
                    defaultValue={comment.text.value ?? ""}
                    onSave={(value) => {
                      const updatedComment = comment.set("text", {
                        format: "plain",
                        value,
                      });

                      // Use the update API to save the edited comment
                      instance?.update(updatedComment).then(() => {
                        setEditCommentId(null);
                      });
                    }}
                  />
                ) : (
                  <>
                    <div className="comment-content">{comment.text.value}</div>
                    <ActionButton
                      label="Edit"
                      onClick={() => setEditCommentId(comment.id)}
                      className="comment-button"
                    />
                    <ActionButton
                      label="Delete"
                      variant="error"
                      // Use the delete API to remove the comment
                      onClick={() => instance?.delete(comment)}
                      className="comment-button"
                    />
                  </>
                )}
              </div>
            ))}
            <Editor
              placeholder="Add a comment"
              aria-label="Comment"
              autoFocus
              clearOnSave
              saveOnEnter
              onSave={async (value) => {
                if (!instance) {
                  return;
                }

                const commentsInThread = (await instance.getComments()).filter(
                  (c) => c.rootId === id,
                );

                const isFirstComment = commentsInThread.size === 0;

                if (isFirstComment) {
                  /*
                   * In case of first comment, the SDK already creates a draft comment along with CommentMarkerAnnotation.
                   * So we need to update that draft comment instead of creating a new one.
                   */

                  const draftCommentInThread: Comment =
                    // includeDrafts option helps us fetch draft comments
                    (await instance.getComments({ includeDrafts: true }))
                      .filter((c) => c.rootId === id && c.pageIndex === null)
                      .first();

                  const annotations = await instance.getAnnotations(
                    instance.viewState.currentPageIndex,
                  );

                  /* We also need to mark the associated CommentMarkerAnnotation as the root of the comment thread. */
                  const rootAnnotation = annotations
                    .find((a) => a.id === id)
                    ?.set("isCommentThreadRoot", true);

                  if (!rootAnnotation) {
                    return;
                  }

                  // Update the draft comment with the content and pageIndex which publishes it
                  const newComment = draftCommentInThread
                    .set("text", {
                      format: "plain",
                      value,
                    })
                    .set("pageIndex", instance.viewState.currentPageIndex);

                  // Use update API to update both the draft comment and the root annotation
                  await instance.update([newComment, rootAnnotation]);
                } else {
                  /* For subsequent comments, we can create new comments without relying on draft comments. */
                  const newComment = new Comment({
                    rootId: id,
                    text: {
                      format: "plain",
                      value,
                    },
                    pageIndex: instance.viewState.currentPageIndex,
                    createdAt: new Date(),
                  });

                  // Use create API to add the new comment
                  await instance.create(newComment);
                }
              }}
            />
          </Box>
        </I18nProvider>
      </FrameProvider>
    </ThemeProvider>
  );
};

export default CommentThread;
