const Post = require('../models/Post');
const { ownershipFilter } = require('../utils/authz');

exports.list = async (req,res)=>{
  const filter = ownershipFilter(req.user, {});
  const posts = await Post.find(filter).populate('authorId','name email');
  res.json(posts);
};

exports.get = async (req,res)=>{
  const p = await Post.findById(req.params.id);
  if(!p) return res.sendStatus(404);
  const filter = ownershipFilter(req.user, { _id: p._id });
  const found = await Post.findOne(filter);
  if(!found) return res.sendStatus(403);
  res.json(found);
};

exports.create = async (req,res)=>{
  const post = new Post({ ...req.body, authorId: req.user.userId });
  await post.save();
  res.status(201).json(post);
};

exports.update = async (req,res)=>{
  const filter = ownershipFilter(req.user, { _id: req.params.id });
  const updated = await Post.findOneAndUpdate(filter, { ...req.body, updatedAt: new Date() }, { new:true });
  if(!updated) return res.sendStatus(403);
  res.json(updated);
};

exports.remove = async (req,res)=>{
  const filter = ownershipFilter(req.user, { _id: req.params.id });
  const removed = await Post.findOneAndDelete(filter);
  if(!removed) return res.sendStatus(403);
  res.json({ ok:true });
};
