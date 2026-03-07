export function canRunConvexQuery(params: {
  isClerkLoaded: boolean;
  isSignedIn: boolean;
  isConvexAuthenticated: boolean;
}) {
  const { isClerkLoaded, isSignedIn, isConvexAuthenticated } = params;
  return isClerkLoaded && isSignedIn && isConvexAuthenticated;
}
