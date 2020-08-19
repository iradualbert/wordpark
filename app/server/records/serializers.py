from django.contrib.auth.models import User
from rest_framework import serializers
from .models import List, Word

class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = '__all__'
        read_only_fields = ['user']

        
class WordSerializer(serializers.ModelSerializer):
    wordlist = serializers.SerializerMethodField('get_list')
    class Meta:
        model = Word
        fields = '__all__'
        read_only_fields = ['user']

    
    def get_list(self, obj):
        obj_list = obj.wordlist
        if obj_list:
            return obj_list.name
        return None