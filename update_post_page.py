import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\src\frontend\src\pages\PostPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import ReportModal
import_report_old = """import { EditPostModal } from "#frontend/components/EditPostModal";"""
import_report_new = """import { EditPostModal } from "#frontend/components/EditPostModal";
import { ReportModal } from "#frontend/components/ReportModal";"""
content = content.replace(import_report_old, import_report_new)

# 2. Add state for reportingCommentId in PostPage
postpage_state_old = """  const [isEditModalOpen, setIsEditModalOpen] = useState(false);"""
postpage_state_new = """  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);"""
content = content.replace(postpage_state_old, postpage_state_new)

# 3. Add ReportModal component rendering at the end of PostPage
postpage_return_old = """      </main>
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={postQuery.data}
      />
    </div>
  );
}"""
postpage_return_new = """      </main>
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={postQuery.data}
      />
      <ReportModal
        isOpen={!!reportingCommentId}
        onClose={() => setReportingCommentId(null)}
        targetId={reportingCommentId}
        targetType="comment"
      />
    </div>
  );
}"""
content = content.replace(postpage_return_old, postpage_return_new)

# 4. Modify CommentBranch props to accept onReport
branch_props_old = """function CommentBranch({ comment, comments, user, postId, depth = 0 }: { comment: any; comments: any[]; user: any; postId: string; depth?: number }) {"""
branch_props_new = """function CommentBranch({ comment, comments, user, postId, depth = 0, onReport }: { comment: any; comments: any[]; user: any; postId: string; depth?: number; onReport: (commentId: string) => void }) {"""
content = content.replace(branch_props_old, branch_props_new)

# 5. Fix recursive CommentBranch calls to pass onReport
branch_recur_old1 = """<CommentBranch comment={child} comments={comments} user={user} postId={postId} depth={depth + 1} />"""
branch_recur_new1 = """<CommentBranch comment={child} comments={comments} user={user} postId={postId} depth={depth + 1} onReport={onReport} />"""
content = content.replace(branch_recur_old1, branch_recur_new1)

branch_recur_old2 = """<CommentBranch key={child.id} comment={child} comments={comments} user={user} postId={postId} depth={MAX_DEPTH} />"""
branch_recur_new2 = """<CommentBranch key={child.id} comment={child} comments={comments} user={user} postId={postId} depth={MAX_DEPTH} onReport={onReport} />"""
content = content.replace(branch_recur_old2, branch_recur_new2)

# 6. Fix root CommentBranch calls in PostPage
root_branch_old = """<CommentBranch key={comment.id} comment={comment} comments={commentsQuery.data?.items ?? []} user={user} postId={postId} />"""
root_branch_new = """<CommentBranch key={comment.id} comment={comment} comments={commentsQuery.data?.items ?? []} user={user} postId={postId} onReport={setReportingCommentId} />"""
content = content.replace(root_branch_old, root_branch_new)

# 7. Modify the 3-dot menu condition and contents in CommentBranch
# From `{user?.id === comment.authorId && (` to `{user && (`
menu_cond_old = """            {user?.id === comment.authorId && (
              <div className="relative ml-2" ref={optionsMenuRef}>"""
menu_cond_new = """            {user && (
              <div className="relative ml-2" ref={optionsMenuRef}>"""
content = content.replace(menu_cond_old, menu_cond_new)

# Update menu contents
menu_body_old = """                  <div className="absolute right-0 top-full mt-1 w-32 bg-surface-container rounded-lg shadow-xl border border-outline-variant py-1 z-20">
                    <button onClick={() => { setEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-container-highest transition-colors">
                      Edit
                    </button>
                    <button onClick={() => { setShowDeleteDialog(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface-container-highest transition-colors">
                      Delete
                    </button>
                  </div>"""

menu_body_new = """                  <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container rounded-lg shadow-xl border border-outline-variant py-1 z-20">
                    {user?.id === comment.authorId ? (
                      <>
                        <button onClick={() => { setEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-container-highest transition-colors">
                          Edit
                        </button>
                        <button onClick={() => { setShowDeleteDialog(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface-container-highest transition-colors">
                          Delete
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { onReport(comment.id); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                        Report Comment
                      </button>
                    )}
                  </div>"""
content = content.replace(menu_body_old, menu_body_new)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PostPage")
