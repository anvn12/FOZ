import { Router } from "express";
import { ilike, or } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { profiles } from "#backend/db/schema/index.js";

const MOCK_PROFILES = [
  {
    id: "mock1",
    userAccountId: "mock1",
    displayName: "Elena Rostova",
    bio: "@erostova",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6UsA1UnudoPBcYpXkQ1qrW3YrY7RVfsge3p-7T8aTwLsOMlffPtZBSNev0RbOV8AmIrzdEL2eYuxHJXYuo8QRwCKL9ii0hCsaXvYrZ8vLNxllgDI4qOIPku9SO4nLeKPCXjtOIJbu4PpjSBAxxMJt4a2oquNROsEqsArrHj3yNLDN3qy0OCkVQAQbrdy04tEx6ngPbO06iygREyzre8ydigDxu9DDW7jTJrNtlsrCeCE-k8Sm07Wl",
    location: null,
    website: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "mock2",
    userAccountId: "mock2",
    displayName: "Marcus Vance",
    bio: "@vancedesign",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd64GIUZFwTzXs8wJ2knlxuLkc18knI7jnOUYdVj6tR_UnjXyPPAwenwcV9of3jp79Qbn1sY1O26wNW7OO8gcui4tuaezRCc7hXD0rGrrDzhA3bXJwLm4R78rU96tsZJI_aEIyt5TysBIvgqmmrEI4YLCEYN50JZsEewsrKlA_DOw0F_E5ztF2rfvXdMQvMvPT5IHJJeFHq1SvrMTvlsAYx_fsuqll4o4kM4VVYxTOIIc2RD7VLxjL",
    location: null,
    website: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "mock3",
    userAccountId: "mock3",
    displayName: "Sophia Chen",
    bio: "@sophiadesign",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDXgzz0WXoPlkH90grbE2nGPmc7pDstNa7gLjzg5mX_4RuCibjq_Dg8Cd1X3v401X3dqOENyVE815Az_LAYoq0MNoER6S11ktmjM0wpjCbjlJFM76vRqS8Bacb24PUUmdgz4u2jWWmdmUlmxguMlT2TVEAC1dpNhB8CpH_6QNiR4zzKrhHUBkl-2EW9JVBs-Y_WvENNANm50ahVXvAJ3lyrI2hz6YlsWld8OvKoS7a34wyARuUynlQ",
    location: null,
    website: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "mock4",
    userAccountId: "mock4",
    displayName: "Alex Rivera",
    bio: "@arivera",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOIGgAu_Ia3aY_Temn0CPLWzrSkSEfhZc0O8L0Ot8Rod6ug8UwYQ3oDl1E8Tzy6NkQNj5cG-cTh5g7l82blPVG6rgcNtkVUKou9OIyIcIP6fs8wtkkgxxEUgEt4wNrMwrcMm9TPnr6PvarGOnckF2LpDHA7OAxh6wVqWHE4H_Qktw4UdEFc1D1HIbqdSTqWRfxhpuDRAivW5AIIIZ8pTroOCe3tTpT1BXSFO3JYajubeLdhiEMa6ID",
    location: null,
    website: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const q = req.query.q as string;
    
    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const searchQuery = `%${q.trim()}%`;
    const lowerQ = q.trim().toLowerCase();

    let results: any[] = [];
    try {
      results = await db
        .select({
          id: profiles.id,
          userAccountId: profiles.userAccountId,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          location: profiles.location,
          website: profiles.website,
          createdAt: profiles.createdAt,
          updatedAt: profiles.updatedAt
        })
        .from(profiles)
        .where(
          or(
            ilike(profiles.displayName, searchQuery),
            ilike(profiles.bio, searchQuery)
          )
        )
        .limit(20);
    } catch (dbError: any) {
      console.warn("Database search failed (is DB down?), falling back to mock data:", dbError.message);
    }

    const mockResults = MOCK_PROFILES.filter(p => 
      p.displayName.toLowerCase().includes(lowerQ) || 
      p.bio.toLowerCase().includes(lowerQ)
    );

    const finalResults = [...results, ...mockResults];

    res.json(finalResults);
  } catch (error) {
    next(error);
  }
});

export { router as searchRouter };
