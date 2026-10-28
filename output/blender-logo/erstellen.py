import bpy, re, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
src=(ROOT.parent/'logo-materials/original.svg').read_text()
els=re.findall(r'<(?:path|ellipse)\b[^>]*/>',src)
groups=[[19],[8,16,17],[3],[7],[6],[9],[12],[10,14],[5,15],[11,13,1,2],[4],[0]]
names=['01_1_Silber','02_K_Pluesch','03_R_Latex','04_E_Chrom','05_A_Glas','06_T_Beton','07_I_Irisierend','08_V_Harz','09_B_Keramik','10_UE_Gummi','11_R_Holz','12_O_Gold']
colors=[(.55,.6,.65,1),(.95,.08,.35,1),(.012,.014,.018,1),(.8,.85,.9,1),(.8,.9,.95,1),(.55,.52,.46,1),(.35,.08,.7,1),(.015,.35,.8,1),(.95,.16,.015,1),(.36,.055,.7,1),(.32,.12,.035,1),(.83,.51,.09,1)]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
letters=bpy.data.collections.new('01_Buchstaben_editierbare_Kurven');bpy.context.scene.collection.children.link(letters)
for i,ids in enumerate(groups):
 p=ROOT/(names[i]+'.svg')
 p.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="841.89" height="113.39" viewBox="0 0 841.89 113.39">'+''.join(re.sub(r'class="[^"]*"','fill="black"',els[j]) for j in ids)+'</svg>')
 before=set(bpy.data.objects);bpy.ops.import_curve.svg(filepath=str(p));obs=list(set(bpy.data.objects)-before)
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();o=bpy.context.object;o.name=names[i]
 for c in list(o.users_collection):c.objects.unlink(o)
 letters.objects.link(o)
 o.scale=(35,35,35);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.dimensions='2D';o.data.fill_mode='BOTH';o.data.resolution_u=24;o.data.extrude=.10;o.data.bevel_depth=0
 o['Hinweis']='SVG-Konturen unveraendert; Tiefe unter Kurvendaten > Geometrie > Extrudieren.'
 m=bpy.data.materials.new(names[i]);m.diffuse_color=colors[i];m.use_nodes=True;n=m.node_tree.nodes;links=m.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Base Color'].default_value=colors[i];bs.inputs['Roughness'].default_value=[.26,.85,.22,.12,.08,.88,.2,.15,.2,.75,.48,.22][i]
 bs.inputs['Metallic'].default_value=1 if i in [0,3,6,11] else 0
 if i in [4,7]:bs.inputs['Transmission Weight'].default_value=.85;bs.inputs['IOR'].default_value=1.45
 if i==1:bs.inputs['Sheen Weight'].default_value=.9
 if i in [1,2,5,9,10,11]:
  noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=[90,150,9,20,20,65,20,20,20,90,7,22][i];noise.inputs['Detail'].default_value=4
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.35 if i in [5,10,11] else .17;bump.inputs['Distance'].default_value=.025;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
  if i in [5,10]:
   ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=tuple(v*.28 for v in colors[i][:3])+(1,);ramp.color_ramp.elements[1].color=colors[i];links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],bs.inputs['Base Color'])
 if i==6:bs.inputs['Coat Weight'].default_value=.6;bs.inputs['Coat Tint'].default_value=(.1,.8,.65,1)
 o.data.materials.clear();o.data.materials.append(m)
# Center all glyphs together, preserve their relative positions.
pts=[o.matrix_world@Vector(c) for o in letters.objects for c in o.bound_box];lo=Vector(tuple(min(p[a] for p in pts) for a in range(3)));hi=Vector(tuple(max(p[a] for p in pts) for a in range(3)));center=(lo+hi)/2
for o in letters.objects:o.location-=center
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
bpy.ops.object.camera_add(location=(0,0,16));cam=bpy.context.object;cam.name='Kamera_Front_Orthografisch';cam.data.type='ORTHO';cam.data.ortho_scale=(hi.x-lo.x)*1.06;scene.camera=cam
for loc,power,size in [((-3,4,7),1300,7),((4,1,5),1000,5),((0,-4,4),800,4)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
scene.world.color=(.3,.3,.3);scene.render.film_transparent=True;scene.render.resolution_x=2400;scene.render.resolution_y=420;scene.render.resolution_percentage=100
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.object.select_all(action='DESELECT')
for o in letters.objects:o.select_set(True)
bpy.context.view_layer.objects.active=letters.objects[0]
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'1kreativbuero-material-3D.blend'))
scene.render.filepath=str(ROOT/'vorschau-3D.png');bpy.ops.render.render(write_still=True)
print('COMPLETE',len(letters.objects),'glyphs')
