import React, { useEffect } from "react";
import {
  ActionButton,
  I18nProvider,
  ThemeProvider,
  FrameProvider,
  Editor,
} from "@baseline-ui/core";
import { Comment, Instance, List } from "@nutrient-sdk/viewer";

interface CommentThreadProps {
  instance: Instance | null;
  id: string;
}

const CommentThread = (props: CommentThreadProps) => {
  const { instance, id } = props;
  const [comments, setComments] = React.useState<List<Comment> | null>(null);
  const [editCommentId, setEditCommentId] = React.useState<string | null>(null);

  useEffect(() => {
    const syncComments = () => {
      instance?.getComments().then((initialComments) => {
        const commentsInThread = initialComments.filter((c) => c.rootId === id);
        setComments(commentsInThread);
      });
    };

    instance?.addEventListener("comments.change", syncComments);
  }, [instance, id, setComments]);

  return (
    <ThemeProvider>
      <FrameProvider>
        <I18nProvider locale="en-US">
          <div className="comment-thread-container">
            <p>Total comments: {comments?.size ?? 0}</p>
            {comments?.map((comment) => (
              <div key={comment.id} className="comment-container">
                {editCommentId === comment.id ? (
                  <Editor
                    placeholder="Enter your comment"
                    autoFocus
                    aria-label="Comment editor"
                    defaultValue={comment.text.value!}
                    enableRichText
                    onSave={(value) => {
                      const updatedComment = comment.set("text", {
                        format: "xhtml",
                        value,
                      });
                      instance?.update(updatedComment).then(() => {
                        setEditCommentId(null);
                      });
                    }}
                  />
                ) : (
                  <>
                    <div
                      dangerouslySetInnerHTML={{ __html: comment.text.value! }}
                    />
                    <ActionButton
                      label="Edit"
                      onPress={() => setEditCommentId(comment.id)}
                    />
                  </>
                )}

                <ActionButton
                  label="Delete"
                  onClick={() => instance?.delete(comment)}
                />
              </div>
            ))}
            <Editor
              placeholder="Custom Editor"
              aria-label="Comment editor"
              onSave={(value) => {
                const newComment = new Comment({
                  text: {
                    format: "xhtml",
                    value,
                  },
                  // need to set rootId to previous comment in thread
                  rootId: id,
                });
                // This errors out for first comment creation. Needs investigation.
                instance?.create(newComment).then((ss) => {
                  console.log("Comment created:", ss);
                });
              }}
            />
          </div>
        </I18nProvider>
      </FrameProvider>
    </ThemeProvider>
  );
};

export default CommentThread;
