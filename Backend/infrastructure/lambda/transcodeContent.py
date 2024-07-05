import json
import boto3
import os
import base64
import subprocess

s3 = boto3.client('s3')

def handler(event, context):

    bucket_name = os.environ['BUCKET_NAME']


    file_name = event.get('fileName')
    movie_id = event.get('id')
    resolution = event.get('resolution', "")
    resolutionBase = event.get('resolutionBase','')
    
    input_file_path = f'/tmp/{os.path.basename(resolutionBase)}' + '.mp4'
    input_key = movie_id + "-" + file_name + "/" + resolutionBase + ".mp4"
    output_file_path = f'/tmp/resized_{os.path.basename(resolution)}' + '.mp4'

    resolution_map = {
            '144': (256, 144),
            '360': (640, 360),
            '480': (854,480),
            '720': (1280, 720)
            }
    new_resolution = resolution_map.get(resolution)

    s3.download_file(bucket_name, input_key, input_file_path)

    command = [
            '/opt/bin/ffmpeg','-y',
            '-i', input_file_path,
            '-vf', f'scale={new_resolution[0]}:{new_resolution[1]}',
            '-preset', 'ultrafast','-crf','23','-c:a','copy',
            output_file_path
    ]
    
    subprocess.run(command, capture_output=True, text=True)
    
    resized_video_path = movie_id + "-" +  f"{file_name}/{resolution}" + ".mp4"
    
    s3.upload_file(output_file_path, bucket_name, resized_video_path)


    return {
        'statusCode': 200,
        'body': {
            "file_name":file_name,
        }
    }