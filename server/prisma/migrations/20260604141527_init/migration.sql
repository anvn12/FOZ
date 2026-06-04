BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [avatarUrl] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Thread] (
    [id] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(500) NOT NULL,
    [imageUrl] NVARCHAR(1000),
    [likeCount] INT NOT NULL CONSTRAINT [Thread_likeCount_df] DEFAULT 0,
    [replyCount] INT NOT NULL CONSTRAINT [Thread_replyCount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Thread_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Thread_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Reply] (
    [id] NVARCHAR(1000) NOT NULL,
    [threadId] NVARCHAR(1000) NOT NULL,
    [authorId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(500) NOT NULL,
    [likeCount] INT NOT NULL CONSTRAINT [Reply_likeCount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Reply_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Reply_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Like] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [threadId] NVARCHAR(1000),
    [replyId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Like_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Like_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Like_userId_threadId_key] UNIQUE NONCLUSTERED ([userId],[threadId]),
    CONSTRAINT [Like_userId_replyId_key] UNIQUE NONCLUSTERED ([userId],[replyId])
);

-- CreateTable
CREATE TABLE [dbo].[Follow] (
    [id] NVARCHAR(1000) NOT NULL,
    [followerId] NVARCHAR(1000) NOT NULL,
    [followingId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Follow_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Follow_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Follow_followerId_followingId_key] UNIQUE NONCLUSTERED ([followerId],[followingId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Thread] ADD CONSTRAINT [Thread_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reply] ADD CONSTRAINT [Reply_threadId_fkey] FOREIGN KEY ([threadId]) REFERENCES [dbo].[Thread]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Reply] ADD CONSTRAINT [Reply_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Like] ADD CONSTRAINT [Like_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Like] ADD CONSTRAINT [Like_threadId_fkey] FOREIGN KEY ([threadId]) REFERENCES [dbo].[Thread]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Like] ADD CONSTRAINT [Like_replyId_fkey] FOREIGN KEY ([replyId]) REFERENCES [dbo].[Reply]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Follow] ADD CONSTRAINT [Follow_followerId_fkey] FOREIGN KEY ([followerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Follow] ADD CONSTRAINT [Follow_followingId_fkey] FOREIGN KEY ([followingId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
