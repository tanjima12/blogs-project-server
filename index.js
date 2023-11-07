const express = require("express");
const cors = require("cors");

require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5006;
app.use(express.json());
// app.use(cors());
// app.use(
//   cors({
//     origin: ["http://localhost:5174"],
//     credentials: true,
//   })
// );
// app.use(
//   cors({
//     origin: "http://localhost:5174",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xzkprd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const NewsCollection = client.db("recentNews").collection("NewsCollection");
    const WishListCollection = client.db("recentNews").collection("WishList");
    const CommentCollection = client.db("recentNews").collection("CommentInfo");
    // Send a ping to confirm a successful connection

    app.get("/addBlog", async (req, res) => {
      // let query = {};
      let sortObj = {};
      let queryObj = {};
      const category = req.query.category;
      console.log(category);

      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;

      if (sortField && sortOrder) {
        sortObj[sortField] = sortOrder;
      }
      if (category) {
        queryObj.Category = category;
      }
      const cursor = NewsCollection.find(queryObj).sort(sortObj);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/addBlog", async (req, res) => {
      const newBlog = req.body;
      console.log(newBlog);
      newBlog.time = parseInt(newBlog.time);
      const result = await NewsCollection.insertOne(newBlog);
      res.send(result);
    });
    app.get("/blogdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await NewsCollection.findOne(query);
      res.send(result);
    });
    // app.get("/comment/:blogId", async (req, res) => {
    //   const blogId = req.params.blogId;
    //   const query = { blogId };
    //   const result = await CommentCollection.find(query).toArray();
    //   res.send(result);
    // });
    // app.get("/wishList/:id", async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);

    //   // const cursor = await WishListCollection.find({ _id: new ObjectId(id) });
    //   const wishlistItems = await cursor.toArray();
    //   const blogIds = wishlistItems.map((item) => item.id);

    //   const result = await NewsCollection.find({
    //     _id: { $in: blogIds.map((id) => new ObjectId(id)) },
    //   }).toArray();

    //   console.log(result);
    //   res.send(result);
    // });

    app.get("/addToWishlist", async (req, res) => {
      // const userId = req.params.userId;
      const wishlistItems = await WishListCollection.find().toArray();
      res.send(wishlistItems);
    });
    // app.post("/addToWishlist/:userId/:blogId", async (req, res) => {
    //   const userId = req.params.userId;
    //   const blogId = req.params.blogId;
    //   const blog = req.body;

    //   // Check if the blog is already in the user's wishlist (you might want to do this)
    //   const existingWishlistItem = await WishListCollection.findOne({
    //     //   userId: userId,
    //     blogId: blogId,
    //   });

    //   if (existingWishlistItem) {
    //     res.status(400).json({ message: "Blog is already in the wishlist." });
    //     return;
    //   }

    //   // Now you can store the blog information in the database
    //   const wishlistItem = {
    //     blog: blog, // Store the entire blog information
    //   };

    //   const result = await WishListCollection.insertOne(wishlistItem);
    //   res.json(result);
    // });

    app.post("/addToWishlist/:id", async (req, res) => {
      const id = req.params.id;
      const blog = req.body;

      const existingWishlistItem = await WishListCollection.findOne({
        _id: new ObjectId(id),
      });

      if (existingWishlistItem) {
        res.status(400).json({ message: "Blog is already in the wishlist." });
        return;
      }

      const result = await WishListCollection.insertOne(blog);
      res.json(result);
    });

    //   // let query = {};
    //   // let sortObj = {};
    //   // let queryObj = {};
    //   // const category = req.query.category;
    //   // console.log(category);

    //   // const sortField = req.query.sortField;
    //   // const sortOrder = req.query.sortOrder;

    //   // if (sortField && sortOrder) {
    //   //   sortObj[sortField] = sortOrder;
    //   // }
    //   // if (category) {
    //   //   queryObj.Category = category;
    //   // }
    //   const cursor = CommentCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    //   // const id = req.params.id;
    //   // const query = { _id: new ObjectId(id) };
    //   // const result = await CommentCollection.findOne(query);
    //   // res.send(result);
    // });
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      console.log(comment);

      const result = await CommentCollection.insertOne(comment);
      res.send(result);
    });
    app.get("/comments/:blogId", async (req, res) => {
      const { blogId } = req.params;
      // console.log(blogId);
      const query = { blogId: blogId };
      const cursor = await CommentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // app.get("/blog/:blogId", async (res, req) => {
    //   const blogId = req.params;
    //   const query = { _id: new ObjectId(blogId) };
    //   const result = await NewsCollection.findOne(query);
    //   res.send(result);
    // });

    app.get("/updateBlog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await NewsCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    //update
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBlog = req.body;
      const nameBlog = {
        $set: {
          Title: updatedBlog.title,
          Category: updatedBlog.Category,
          ShortDescription: updatedBlog.ShortDescription,
          time: updatedBlog.time,
          PhotoUrl: updatedBlog.PhotoUrl,
          email: updatedBlog.email,
          name: updatedBlog.name,
          Longdescription: updatedBlog.Longdescription,
        },
      };
      const result = await NewsCollection.updateOne(filter, nameBlog, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Blog side server is running");
});
app.listen(port, (req, res) => {
  console.log(`Blog server is running on port:${port}`);
});
