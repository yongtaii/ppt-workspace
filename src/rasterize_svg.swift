// Rasterize SVG files to transparent PNGs with AppKit.
// Usage: swift src/rasterize_svg.swift <in.svg> <out.png> <width> <height> [...]
import AppKit

let args = Array(CommandLine.arguments.dropFirst())
guard args.count % 4 == 0, !args.isEmpty else {
  FileHandle.standardError.write("usage: <in.svg> <out.png> <width> <height> ...\n".data(using: .utf8)!)
  exit(2)
}
for i in stride(from: 0, to: args.count, by: 4) {
  let (src, dst) = (args[i], args[i + 1])
  guard let w = Int(args[i + 2]), let h = Int(args[i + 3]), let img = NSImage(contentsOfFile: src) else {
    FileHandle.standardError.write("cannot rasterize \(src)\n".data(using: .utf8)!)
    exit(1)
  }
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  img.draw(in: NSRect(x: 0, y: 0, width: w, height: h))
  NSGraphicsContext.restoreGraphicsState()
  try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: dst))
}
