from rest_framework import serializers
from .models import User, Job, Application

class UserSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','role','age','city',
                  'bio','skills','company','industry','website','password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        skills = validated_data.pop('skills', [])
        user = User(**validated_data)
        user.set_password(password)
        user.skills = skills
        user.save()
        return user

class JobSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    employer_name = serializers.SerializerMethodField()
    app_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id','title','company','salary','skills','location','deadline',
                  'description','employer_id','employer_name','app_count','created_at']
        read_only_fields = ['employer_id','created_at']

    def get_employer_name(self, obj): return obj.employer.get_full_name() or obj.employer.username
    def get_app_count(self, obj): return obj.applications.count()

    def create(self, validated_data):
        skills = validated_data.pop('skills', [])
        job = Job(**validated_data)
        job.skills = skills
        job.save()
        return job

    def update(self, instance, validated_data):
        if 'skills' in validated_data:
            instance.skills = validated_data.pop('skills')
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance

class ApplicationSerializer(serializers.ModelSerializer):
    seeker_name = serializers.SerializerMethodField()
    seeker_email = serializers.SerializerMethodField()
    seeker_skills = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id','job_id','seeker_id','seeker_name','seeker_email','seeker_skills',
                  'job_title','status','created_at']
        read_only_fields = ['seeker_id','created_at']

    def get_seeker_name(self, obj): return obj.seeker.get_full_name() or obj.seeker.username
    def get_seeker_email(self, obj): return obj.seeker.email
    def get_seeker_skills(self, obj): return obj.seeker.skills
    def get_job_title(self, obj): return obj.job.title
