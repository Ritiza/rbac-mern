// ownership filter applied to mongo queries
module.exports.ownershipFilter = function(user, baseFilter){
  if(!user) return { ...baseFilter, _id: null }; // no access
  if(user.role === 'admin') return baseFilter;
  if(user.role === 'editor'){
    // editors only on their own documents
    return { ...baseFilter, authorId: user.userId };
  }
  // viewers only read (handled by capabilities) but no ownership
  return baseFilter;
};
