BEGIN TRY

BEGIN TRAN;

-- Drop unfiltered unique constraints (MSSQL treats multiple NULL replyIds as duplicates)
ALTER TABLE [dbo].[Like] DROP CONSTRAINT [Like_userId_threadId_key];
ALTER TABLE [dbo].[Like] DROP CONSTRAINT [Like_userId_replyId_key];

-- Filtered unique indexes: one like per user per non-null target
CREATE UNIQUE NONCLUSTERED INDEX [Like_userId_threadId_filtered]
ON [dbo].[Like]([userId], [threadId])
WHERE [threadId] IS NOT NULL;

CREATE UNIQUE NONCLUSTERED INDEX [Like_userId_replyId_filtered]
ON [dbo].[Like]([userId], [replyId])
WHERE [replyId] IS NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
