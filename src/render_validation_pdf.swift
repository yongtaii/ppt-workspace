import Foundation
import AppKit
import PDFKit
import CoreGraphics

let args = CommandLine.arguments
guard args.count >= 3, let document = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    fatalError("Usage: swift render_validation_pdf.swift input.pdf output-directory")
}
let folder = URL(fileURLWithPath: args[2], isDirectory: true)
try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
let width = 1920, height = 1080
var pages = [[String: Any]]()
var images = [NSImage]()
for i in 0..<document.pageCount {
    guard let page = document.page(at: i) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil, pixelsWide:width, pixelsHigh:height,
        bitsPerSample:8, samplesPerPixel:4, hasAlpha:true, isPlanar:false,
        colorSpaceName:.deviceRGB, bytesPerRow:0, bitsPerPixel:0)!
    let graphics = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphics
    let ctx = graphics.cgContext
    ctx.setFillColor(CGColor(gray:1,alpha:1)); ctx.fill(CGRect(x:0,y:0,width:width,height:height))
    ctx.scaleBy(x:CGFloat(width)/bounds.width,y:CGFloat(height)/bounds.height)
    page.draw(with:.mediaBox,to:ctx)
    NSGraphicsContext.restoreGraphicsState()
    let file = folder.appendingPathComponent(String(format:"slide-%02d.png",i+1))
    try bitmap.representation(using:.png,properties:[:])!.write(to:file)
    images.append(NSImage(contentsOf:file)!)
    pages.append(["number":i+1,"width":bounds.width,"height":bounds.height,"text":page.string ?? ""])
}
let thumbW = 480.0, thumbH = 270.0, gap = 18.0, cols = 3, rows = Int(ceil(Double(images.count)/3))
let overview = NSImage(size:NSSize(width:Double(cols)*thumbW+Double(cols+1)*gap,height:Double(rows)*thumbH+Double(rows+1)*gap))
overview.lockFocus()
NSColor(calibratedRed:0.9,green:0.92,blue:0.94,alpha:1).setFill()
NSRect(origin:.zero,size:overview.size).fill()
for (i,img) in images.enumerated() {
    let x=gap+Double(i%cols)*(thumbW+gap)
    let y=overview.size.height-gap-Double(i/cols+1)*thumbH-Double(i/cols)*gap
    img.draw(in:NSRect(x:x,y:y,width:thumbW,height:thumbH))
}
overview.unlockFocus()
let overviewBitmap=NSBitmapImageRep(data:overview.tiffRepresentation!)!
try overviewBitmap.representation(using:.png,properties:[:])!.write(to:folder.appendingPathComponent("overview.png"))
let report:[String:Any] = ["renderer":"LibreOffice Impress 26.8.1.1 → PDF → PDFKit PNG","slidesRendered":document.pageCount,"resolution":"1920 × 1080","pages":pages]
try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys]).write(to:folder.appendingPathComponent("render_report.json"))
print("Rendered \(document.pageCount) slides at \(width)×\(height), plus overview.png")
