import subprocess,sys
F="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
# (img, start, end, zoom dir, caption, cap_start)
S=[(1,0,3.6,'in',"29 de abril",0.3),(2,3.6,5.2,'in',None,0),(3,5.2,6.5,'in',"30 de abril",5.3),
   (4,6.5,9.3,'in',"Palácio presidencial",7.9),(5,9.3,13.0,'out',"Duong Van Minh",10.6),(6,13.0,15.03,'in',"Ordem\\: depor as armas",13.5)]
X=0.3
inp=[];fl=[]
for k,(i,a,b,d,cap,cs) in enumerate(S):
    dur=(b-a)+(X if k<len(S)-1 else 0); n=round(dur*30)
    z=f"1.0+0.12*on/{n}" if d=='in' else f"1.12-0.12*on/{n}"
    inp+=["-framerate","30","-loop","1","-t",f"{dur:.3f}","-i",f"scene-0{i}.jpeg"]
    c=f"[{k}:v]scale=3840:-1,zoompan=z='{z}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=30,setsar=1"
    if cap:
        t0=cs-a
        c+=(f",drawbox=x=90:y=880:w=720:h=96:color=black@0.55:t=fill:enable='gte(t,{t0})'"
            f",drawtext=fontfile={F}:text='{cap}':fontsize=54:fontcolor=0xF2E6C8:x=120:y=902:alpha='min(1,(t-{t0})/0.3)':enable='gte(t,{t0})'")
    fl.append(c+f"[v{k}]")
cur="v0";off=0
for k in range(1,len(S)):
    off=S[k][1]-X/2*0-X  # xfade starts X before cut boundary end
    off=S[k][1]-X
    fl.append(f"[{cur}][v{k}]xfade=transition=fade:duration={X}:offset={off:.3f}[x{k}]");cur=f"x{k}"
fl.append(f"[{cur}]fade=t=in:d=0.3,tpad=stop_mode=clone:stop_duration=0.5,format=yuv420p[vout]")
cmd=["ffmpeg","-y","-v","error",*inp,"-i","../narracao.wav","-filter_complex",";".join(fl),"-map","[vout]","-map",f"{len(S)}:a",
 "-c:v","h264_nvenc","-preset","p5","-cq","19","-b:v","0","-r","30","-c:a","aac","-b:a","192k","-t","15.027","../out/direto_16x9.mp4"]
subprocess.run(cmd,check=True)
