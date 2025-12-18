export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${event.node.req.method} ${event.node.req.url}`);
  }
});
