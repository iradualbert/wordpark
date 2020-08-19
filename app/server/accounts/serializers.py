import secrets
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.validators import UniqueValidator

def generate_username():
      username = secrets.token_hex(10)
      return username

# User Serializer
class UserSerializer(serializers.ModelSerializer):
      fullname = serializers.CharField(source="get_full_name", read_only=True)
      class Meta:
            model = User
            fields = ('id', 'fullname', 'username', 'email')

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
      class Meta:
            model = User
            fields = ('id','first_name', 'email', 'password', )
            extra_kwargs = {'password': {'write_only': True},
                        'email': {'required': True,
                                  'validators': [UniqueValidator(User.objects.all(), f'A user with that Email already exists.')]},
                        }
            
      def create(self, validated_data):
            user = User.objects.create_user(email=validated_data['email'],
            username=generate_username(),
            first_name=validated_data['first_name'], 
            password=validated_data['password'])
            return user

# Login Serializer
class LoginSerializer(serializers.Serializer):
      email = serializers.EmailField()
      password = serializers.CharField()
      
      def validate(self, data):
            user = authenticate(**data)
            if user and user.is_active:
                  return user
            raise serializers.ValidationError("Incorrect Credentials")