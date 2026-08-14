import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\src\frontend\src\components\ReportModal.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace reportPost import
import_old = """import { reportPost } from "#frontend/api/interactions";"""
import_new = """import { reportPost, reportComment } from "#frontend/api/interactions";"""
content = content.replace(import_old, import_new)

# Replace ReportModalProps and Component signature
props_old = """interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {"""
props_new = """interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | null;
  targetType: "post" | "comment";
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {"""
content = content.replace(props_old, props_new)

# Replace mutation logic
mutation_old = """  const mutation = useMutation({
    mutationFn: async ({ rType, d }: { rType: string, d: string }) => await reportPost(postId, { reasonType: rType as any, details: d }),"""
mutation_new = """  const mutation = useMutation({
    mutationFn: async ({ rType, d }: { rType: string, d: string }) => {
      if (!targetId) throw new Error("No target specified");
      if (targetType === "post") {
        return await reportPost(targetId, { reasonType: rType as any, details: d });
      } else {
        return await reportComment(targetId, { reasonType: rType as any, details: d });
      }
    },"""
content = content.replace(mutation_old, mutation_new)

# Replace Title
title_old = """<h2 className="text-xl font-bold text-primary">Report Post</h2>"""
title_new = """<h2 className="text-xl font-bold text-primary">Report {targetType === "post" ? "Post" : "Comment"}</h2>"""
content = content.replace(title_old, title_new)

# Replace details placeholder
placeholder_old = """placeholder="Please provide details about how this post violates community guidelines...\""""
placeholder_new = """placeholder={`Please provide details about how this ${targetType} violates community guidelines...`}"""
content = content.replace(placeholder_old, placeholder_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ReportModal")
