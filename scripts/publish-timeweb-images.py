#!/usr/bin/env python3
"""Dry-run by default. No builds. Publishing requires separate owner approval."""
import argparse,json,pathlib,subprocess,sys
root=pathlib.Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser()
parser.add_argument('--execute-after-owner-approval',action='store_true')
args=parser.parse_args()
plan=json.loads((root/'deploy/timeweb/publication-plan.json').read_text())
def docker(*arguments):
    result=subprocess.run(['docker',*arguments],capture_output=True,text=True)
    if result.returncode:raise SystemExit('docker_operation_failed_'+arguments[0])
    return result.stdout
for image in plan['images']:
    found=json.loads(docker('image','inspect',image['localTag']))[0]
    if found['Id'] not in image['acceptedLocalIds'] or found['Architecture']!='amd64' or found['Os']!='linux':
        raise SystemExit('prepared_image_identity_mismatch')
    forbidden={'MIGRATION_DATABASE_URL','MIGRATION_RESET_KEY','STAGE1_TEST_PASSWORD2','RUSENDER_API_TOKEN','KINESCOPE_AUTH_SECRET'}
    if any(value.split('=',1)[0] in forbidden for value in found.get('Config',{}).get('Env',[])):
        raise SystemExit('runtime_secret_env_in_image')
    print(image['localTag']+' -> '+image['targetTag'])
if not args.execute_after_owner_approval:
    print('DRY RUN: no tag, push, login, visibility change or build performed.')
    sys.exit(0)
# Run only after the owner approves these exact packages and public visibility.
# Registry login must already exist; do not pass tokens as CLI arguments.
references={}
for image in plan['images']:
    docker('tag',image['localTag'],image['targetTag'])
    docker('push',image['targetTag'])
    found=json.loads(docker('image','inspect',image['targetTag']))[0]
    package=image['targetTag'].split(':',1)[0]
    digests=[d for d in found.get('RepoDigests',[]) if d.startswith(package+'@sha256:')]
    if len(digests)!=1:raise SystemExit('published_digest_not_resolved')
    references[{'frontend':'FRONTEND_IMAGE','api':'API_IMAGE','worker':'WORKER_IMAGE'}[image['role']]]=digests[0]
print(json.dumps(references,indent=2))
print('Set only these three packages public after explicit approval; verify anonymous pulls before Timeweb deploy. Do not redeploy yet.')
