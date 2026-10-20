// Compose the nine rendered PNGs into a three-column comparison sheet.
import Foundation
import AppKit
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let out=root.appendingPathComponent("output/design-experiments")
let styles=[("A_luxury_minimal","A. 럭셔리 미니멀","아이보리 · 샴페인 골드 · 넓은 여백"),("B_premium_awards","B. 프리미엄 어워즈","딥 차콜 · 골드 조명 · 시상식 타이포그래피"),("C_modern_editorial","C. 모던 에디토리얼","흑백 · 강한 타이포그래피 · 정교한 그리드")]
let labels=["01 / 타이틀","02 / 수상자 5명 전체 소개","03 / 개인 수상자 상세"]
let width=3600,height=2260
let margin:CGFloat=48,gap:CGFloat=30,top:CGFloat=145
let cellW=(CGFloat(width)-margin*2-gap*2)/3,cellH=cellW*9/16
let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:width,pixelsHigh:height,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
let context=NSGraphicsContext(bitmapImageRep:rep)!
NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=context
NSColor(srgbRed:0.89,green:0.89,blue:0.87,alpha:1).setFill();NSBezierPath(rect:NSRect(x:0,y:0,width:width,height:height)).fill()
func text(_ value:String,_ rect:NSRect,_ size:CGFloat,_ color:NSColor,_ bold:Bool=false){
 var font=NSFont(name:"Apple SD Gothic Neo",size:size)!
 if bold {font=NSFontManager.shared.convert(font,toHaveTrait:.boldFontMask)}
 (value as NSString).draw(in:rect,withAttributes:[.font:font,.foregroundColor:color])
}
for (column,style) in styles.enumerated(){
 let x=margin+CGFloat(column)*(cellW+gap)
 text(style.1,NSRect(x:x,y:CGFloat(height)-64,width:cellW,height:40),29,.black,true)
 text(style.2,NSRect(x:x,y:CGFloat(height)-104,width:cellW,height:27),19,.darkGray)
 for row in 0..<3 {
   let y=CGFloat(height)-top-CGFloat(row)*(cellH+61)-cellH
   let file=out.appendingPathComponent(style.0).appendingPathComponent(String(format:"slide-%02d.png",row+1))
   guard let image=NSImage(contentsOf:file) else{fatalError("Missing PNG: \(file.path)")}
   image.draw(in:NSRect(x:x,y:y,width:cellW,height:cellH))
   text(labels[row],NSRect(x:x,y:y-32,width:cellW,height:27),18,.darkGray)
 }
}
NSGraphicsContext.restoreGraphicsState()
try rep.representation(using:.png,properties:[:])!.write(to:out.appendingPathComponent("overview.png"))
print("Created output/design-experiments/overview.png — 3600 × 2260")
