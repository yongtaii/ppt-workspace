// Local macOS OOXML preview renderer. Not a substitute for PowerPoint's engine.
import Foundation
import AppKit
guard CommandLine.arguments.count == 2 else {
 fputs("Usage: swift render_pptx.swift <preview-directory>\n", stderr);exit(2)
}
let out=URL(fileURLWithPath:CommandLine.arguments[1],isDirectory:true)
let model=try JSONSerialization.jsonObject(with:Data(contentsOf:out.appendingPathComponent("render_model.json"))) as! [String:Any]
let pageW=model["width"] as! Double, pageH=model["height"] as! Double
let slides=model["slides"] as! [[String:Any]]
var warnings=[String](); var substitutions=Set<String>()
func num(_ o:[String:Any],_ k:String)->CGFloat {CGFloat((o[k] as? NSNumber)?.doubleValue ?? 0)}
func color(_ hex:String,_ alpha:CGFloat=1)->NSColor {
 let n=UInt32(hex,radix:16) ?? 0
 return NSColor(srgbRed:CGFloat((n>>16)&255)/255,green:CGFloat((n>>8)&255)/255,blue:CGFloat(n&255)/255,alpha:alpha)
}
func paint(_ value:Any?)->NSColor? {
 guard let d=value as? [String:Any],let h=d["color"] as? String else{return nil}
 return color(h,num(d,"alpha"))
}
func render(_ slide:[String:Any],_ cg:CGContext,check:Bool) {
 let context=NSGraphicsContext(cgContext:cg,flipped:true)
 NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=context
 color(slide["background"] as! String).setFill();NSBezierPath(rect:NSRect(x:0,y:0,width:pageW,height:pageH)).fill()
 for o in slide["objects"] as! [[String:Any]] {
   var rect=NSRect(x:num(o,"x"),y:num(o,"y"),width:num(o,"w"),height:num(o,"h"))
   switch o["kind"] as! String {
   case "text":
     if let inset=o["insets"] as? [String:Any] {
       rect=NSRect(x:rect.minX+num(inset,"lIns"),y:rect.minY+num(inset,"tIns"),width:max(1,rect.width-num(inset,"lIns")-num(inset,"rIns")),height:max(1,rect.height-num(inset,"tIns")-num(inset,"bIns")))
     }
     let attributed=NSMutableAttributedString(string:"")
     let paragraphs=o["paragraphs"] as! [[String:Any]]
     for (i,p) in paragraphs.enumerated() {
       if i>0 {attributed.append(NSAttributedString(string:"\n"))}
       let style=NSMutableParagraphStyle();style.alignment=["l":NSTextAlignment.left,"r":.right,"ctr":.center][p["align"] as? String ?? "l"] ?? .left
       style.lineBreakMode = .byWordWrapping
       style.lineHeightMultiple=max(1,num(p,"lineMultiplier"))
       for r in p["runs"] as! [[String:Any]] {
         let face=r["font"] as! String,size=num(r,"size")
         var font=NSFont(name:face,size:size)
         if font == nil {
           font=NSFont(descriptor:NSFontDescriptor(fontAttributes:[.family:face]),size:size)
         }
         if font == nil {substitutions.insert(face);font=NSFont.systemFont(ofSize:size)}
         if r["bold"] as? Bool == true {font=NSFontManager.shared.convert(font!,toHaveTrait:.boldFontMask)}
         let attrs:[NSAttributedString.Key:Any]=[.font:font!,.foregroundColor:color(r["color"] as! String),.kern:num(r,"spacing"),.paragraphStyle:style]
         attributed.append(NSAttributedString(string:r["text"] as! String,attributes:attrs))
       }
     }
     let bounds=attributed.boundingRect(with:NSSize(width:rect.width,height:10000),options:[.usesLineFragmentOrigin,.usesFontLeading])
     if check && ceil(bounds.height)>rect.height+1 {
       warnings.append("Slide \(slide["number"]!): height \(ceil(bounds.height)) > \(rect.height): \(attributed.string)")
     }
     let anchor=o["anchor"] as? String ?? "ctr"
     let dy=anchor=="t" ? 0 : max(0,(rect.height-ceil(bounds.height))/(anchor=="b" ? 1 : 2))
     attributed.draw(with:NSRect(x:rect.minX,y:rect.minY+dy,width:rect.width,height:max(rect.height,bounds.height+2)),options:[.usesLineFragmentOrigin,.usesFontLeading])
   case "image":
     if let image=NSImage(contentsOfFile:o["path"] as! String) {
       let s=image.size, targetRatio=rect.width/rect.height, sourceRatio=s.width/s.height
       var crop=NSRect(origin:.zero,size:s)
       if let c=o["crop"] as? [String:Any] {
         crop=NSRect(x:s.width*num(c,"l"),y:s.height*num(c,"b"),width:s.width*(1-num(c,"l")-num(c,"r")),height:s.height*(1-num(c,"t")-num(c,"b")))
       }
       else if sourceRatio>targetRatio {crop.size.width=s.height*targetRatio;crop.origin.x=(s.width-crop.width)/2}
       else {crop.size.height=s.width/targetRatio;crop.origin.y=(s.height-crop.height)/2}
       image.draw(in:rect,from:crop,operation:.sourceOver,fraction:1,respectFlipped:true,hints:nil)
     }
   default:
     let type=o["type"] as? String ?? "rect"
     let path:NSBezierPath
     if type=="ellipse" {path=NSBezierPath(ovalIn:rect)}
     else if type=="diamond" {
       path=NSBezierPath();path.move(to:NSPoint(x:rect.midX,y:rect.minY));path.line(to:NSPoint(x:rect.maxX,y:rect.midY));path.line(to:NSPoint(x:rect.midX,y:rect.maxY));path.line(to:NSPoint(x:rect.minX,y:rect.midY));path.close()
     } else if type=="line" {path=NSBezierPath();path.move(to:rect.origin);path.line(to:NSPoint(x:rect.maxX,y:rect.maxY))}
     else {path=NSBezierPath(rect:rect)}
     if type != "line",let fill=paint(o["fill"]) {fill.setFill();path.fill()}
     if let stroke=paint(o["stroke"]),num(o,"lineWidth")>0 {stroke.setStroke();path.lineWidth=num(o,"lineWidth");path.stroke()}
   }
 }
 NSGraphicsContext.restoreGraphicsState()
}
let scale:CGFloat=2
let pixW=Int(pageW*scale),pixH=Int(pageH*scale)
var thumbnails=[NSImage]()
for slide in slides {
 let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:pixW,pixelsHigh:pixH,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
 let context=NSGraphicsContext(bitmapImageRep:rep)!
 context.cgContext.translateBy(x:0,y:CGFloat(pixH));context.cgContext.scaleBy(x:scale,y:-scale)
 render(slide,context.cgContext,check:true)
 let name=String(format:"slide-%02d.png",slide["number"] as! Int)
 try rep.representation(using:.png,properties:[:])!.write(to:out.appendingPathComponent(name))
 let img=NSImage(size:NSSize(width:pixW,height:pixH));img.addRepresentation(rep);thumbnails.append(img)
}
let columns=min(2,slides.count)
let rows=(slides.count+columns-1)/columns
let thumbW:CGFloat=764, thumbH=thumbW*CGFloat(pageH/pageW)
let rowHeight=Int(ceil(thumbH))+24
let contactW=columns*788+24,contactH=rows*rowHeight+24
let sheet=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:contactW,pixelsHigh:contactH,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
let sc=NSGraphicsContext(bitmapImageRep:sheet)!
NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=sc
color("E0DCD3").setFill();NSBezierPath(rect:NSRect(x:0,y:0,width:contactW,height:contactH)).fill()
for (index,img) in thumbnails.enumerated() {
 let w:CGFloat=thumbW,h=thumbH
 let x:CGFloat=24+CGFloat(index%columns)*788
 let y:CGFloat=CGFloat(contactH)-24-CGFloat(index/columns)*CGFloat(rowHeight)-h
 img.draw(in:NSRect(x:x,y:y,width:w,height:h))
}
NSGraphicsContext.restoreGraphicsState()
try sheet.representation(using:.png,properties:[:])!.write(to:out.appendingPathComponent("overview.png"))
let report:[String:Any]=["renderer":"macOS AppKit OOXML preview (not PowerPoint)","slidesRendered":slides.count,"textOverflowWarnings":warnings,"fontSubstitutions":Array(substitutions),"previewLimitations":model["previewLimitations"] ?? []]
let json=try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys])
try json.write(to:out.appendingPathComponent("render_report.json"))
print(String(data:json,encoding:.utf8)!)
if !warnings.isEmpty || !substitutions.isEmpty {exit(1)}
