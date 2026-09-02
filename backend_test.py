import os
import requests

BASE = os.environ.get('NEXT_PUBLIC_BASE_URL', 'https://academic-blockchain-2.preview.emergentagent.com').rstrip('/') + '/api'

def req(method, path, **kwargs):
    r = requests.request(method, BASE + path, timeout=45, **kwargs)
    try: data = r.json()
    except ValueError: data = r.text
    print(f'{method} {path} -> {r.status_code}')
    return r, data

def main():
    findings = []
    try:
        r, root = req('GET', '/')
        assert r.status_code == 200 and root.get('status') == 'online'
        r, bad = req('POST', '/auth/login', json={'email':'admin@verichain.ac.id','password':'wrong-password-2026'})
        assert r.status_code == 401
        r, login = req('POST', '/auth/login', json={'email':'admin@verichain.ac.id','password':'admin123'})
        assert r.status_code == 200 and login.get('success') is True and login.get('token') and login.get('user')
        token = login['token']; headers = {'Authorization': f'Bearer {token}'}
        r, me = req('GET', '/auth/me', headers=headers)
        assert r.status_code == 200 and me.get('authenticated') is True
        r, students = req('GET', '/students')
        assert r.status_code == 200 and isinstance(students, list) and students
        student = students[0]; sid = student['id']
        payload = {'name':'Raka Wijaya Santoso','nim':'20260987654','email':'raka.wijaya@student.verichain.ac.id','faculty':'Fakultas Ilmu Komputer','major':'Sains Data (S1)'}
        r, created = req('POST', '/students', json=payload)
        assert r.status_code == 201 and created.get('nim') == payload['nim']; new_sid = created['id']
        r, dup = req('POST', '/students', json=payload)
        assert r.status_code == 400
        r, fetched = req('GET', f'/students/{new_sid}'); assert r.status_code == 200 and fetched['id'] == new_sid
        r, updated = req('PUT', f'/students/{new_sid}', json={'major':'Analitika Data (S1)'})
        assert r.status_code == 200 and updated['major'] == 'Analitika Data (S1)'
        r, certs = req('GET', '/certificates'); assert r.status_code == 200 and isinstance(certs, list) and certs
        cert_payload = {'studentId':new_sid,'certificateName':'Ijazah Sarjana Sains Data (S.Ds)','degree':'Sarjana Sains Data (S.Ds)','faculty':payload['faculty'],'major':'Analitika Data (S1)','gpa':'3.88','honors':'Dengan Pujian (Cum Laude)'}
        r, issued = req('POST', '/certificates', json=cert_payload)
        assert r.status_code == 201 and issued.get('success') is True and issued.get('certificate', {}).get('certificateNumber') and issued['certificate'].get('txHash') and issued['certificate'].get('qrCodeDataUrl') and issued['certificate'].get('studentName')
        cert = issued['certificate']; cid = cert['id']; cnum = cert['certificateNumber']
        r, cf = req('GET', f'/certificates/{cid}'); assert r.status_code == 200 and cf['id'] == cid
        r, verify = req('GET', '/verify/CERT-2026-0001'); assert r.status_code == 200 and verify.get('valid') is True and verify.get('databaseCheck',{}).get('status') == 'SUCCESS_VALID' and verify.get('blockchainCheck',{}).get('status') == 'ON_CHAIN_VERIFIED'
        r, invalid = req('GET', '/verify/INVALID-9999'); assert r.status_code == 404 and invalid.get('valid') is False
        r, bs = req('GET', '/blockchain/status'); assert r.status_code == 200 and isinstance(bs, dict)
        r, stats = req('GET', '/stats'); assert r.status_code == 200 and 'totalStudents' in stats and 'totalCertificates' in stats
        r, deleted = req('DELETE', f'/students/{new_sid}'); assert r.status_code == 200 and deleted.get('success') is True
        print('RESULT: ALL REQUESTED BACKEND FLOWS PASSED')
    except AssertionError as e:
        findings.append('Assertion failed after request; inspect preceding endpoint output')
    except Exception as e:
        findings.append(f'Backend test exception: {type(e).__name__}: {e}')
    if findings:
        for f in findings: print('FINDING:', f)
        raise SystemExit(1)

if __name__ == '__main__': main()
