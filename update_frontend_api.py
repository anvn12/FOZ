import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\src\frontend\src\api\interactions.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

report_post = """export function reportPost(postId: string, input: CreateReportRequest) {
  return call<{ id: string; status: string }>(`/api/v1/posts/${postId}/report`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}"""

report_both = """export function reportPost(postId: string, input: CreateReportRequest) {
  return call<{ id: string; status: string }>(`/api/v1/posts/${postId}/report`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function reportComment(commentId: string, input: CreateReportRequest) {
  return call<{ id: string; status: string }>(`/api/v1/comments/${commentId}/report`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}"""

content = content.replace(report_post, report_both)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated frontend interactions API")
