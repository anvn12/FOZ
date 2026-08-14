import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\src\frontend\src\components\FeedPostItem.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <ReportModal ... postId={post.id} />
# with <ReportModal ... targetId={post.id} targetType="post" />

old_prop = """<ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} postId={post.id} />"""
new_prop = """<ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} targetId={post.id} targetType="post" />"""

content = content.replace(old_prop, new_prop)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated FeedPostItem")
