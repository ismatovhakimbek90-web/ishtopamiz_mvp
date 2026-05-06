from django.core.management.base import BaseCommand
from api.models import User, Job, Application

class Command(BaseCommand):
    help = 'Ma\'lumotlar bazasini test ma\'lumotlar bilan to\'ldirish'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seed data yuklanmoqda...')

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin','admin@ishtop.uz','admin123',role='employer',company='IshTop Admin')

        u1,_ = User.objects.get_or_create(username='ali_karimov', defaults={'email':'ali@test.uz','first_name':'Ali','last_name':'Karimov','role':'seeker','age':24,'city':'Toshkent','bio':'Python va UI/UX bo\'yicha dasturchi.'})
        u1.set_password('123456'); u1.skills=['Python','UI/UX','Django','Figma']; u1.save()

        u2,_ = User.objects.get_or_create(username='malika_yusupova', defaults={'email':'malika@test.uz','first_name':'Malika','last_name':'Yusupova','role':'seeker','age':22,'city':'Samarqand','bio':'SMM mutaxassisi.'})
        u2.set_password('123456'); u2.skills=['SMM','Ingliz tili','Photoshop','Copywriting']; u2.save()

        e1,_ = User.objects.get_or_create(username='techcorp', defaults={'email':'techcorp@test.uz','first_name':'Bobur','last_name':'Rahimov','role':'employer','city':'Toshkent','company':'TechCorp LLC','industry':'IT / Software'})
        e1.set_password('123456'); e1.save()

        e2,_ = User.objects.get_or_create(username='digitalpro', defaults={'email':'digital@test.uz','first_name':'Nodira','last_name':'Xasanova','role':'employer','city':'Toshkent','company':'DigitalPro Agency','industry':'Marketing / SMM'})
        e2.set_password('123456'); e2.save()

        if not Job.objects.exists():
            j1=Job(employer=e1,title='Python Backend Dasturchi',company='TechCorp LLC',salary="5,000,000 — 8,000,000 so'm",location='remote',description='Django/FastAPI yordamida backend tizimlar.')
            j1.skills=['Python','Django','PostgreSQL','REST API']; j1.save()
            j2=Job(employer=e2,title='SMM Mutaxassisi',company='DigitalPro Agency',salary="2,500,000 — 4,000,000 so'm",location='office',description='Ijtimoiy tarmoqlar mutaxassisi.')
            j2.skills=['SMM','Ingliz tili','Photoshop','Copywriting']; j2.save()
            j3=Job(employer=e1,title='UI/UX Dizayner',company='TechCorp LLC',salary="4,000,000 — 6,000,000 so'm",location='hybrid',description='Mobil va web ilovalar uchun UI dizayn.')
            j3.skills=['UI/UX','Figma','Prototyping','Adobe XD']; j3.save()

        self.stdout.write(self.style.SUCCESS('✅ Seed muvaffaqiyatli yakunlandi!'))
        self.stdout.write('\n📋 Test foydalanuvchilar:')
        self.stdout.write('  👤 ali@test.uz / 123456 (ish qidiruvchi)')
        self.stdout.write('  👤 malika@test.uz / 123456 (ish qidiruvchi)')
        self.stdout.write('  🏢 techcorp@test.uz / 123456 (ish beruvchi)')
        self.stdout.write('  🏢 digital@test.uz / 123456 (ish beruvchi)')
        self.stdout.write('  🔑 admin / admin123 (superuser)')
