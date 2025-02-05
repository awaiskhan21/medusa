export default function GET(req, res) {
  res.sendStatus(200).json({ message: "Hello World from admin" });
}
