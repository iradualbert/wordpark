from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from knox.models import AuthToken as Token
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from records.serializers import ListSerializer, WordSerializer

# Register API
class RegisterAPI(generics.GenericAPIView):
  serializer_class = RegisterSerializer
  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    _,token = Token.objects.create(user=user)
    return Response({
      "user": UserSerializer(user, context=self.get_serializer_context()).data,
      "token": f"{token}",
      "lists":[],
      "words": []
    })

# Login API
class LoginAPI(generics.GenericAPIView):
  serializer_class = LoginSerializer

  def post(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data
    _,token = Token.objects.create(user=user)
    lists = ListSerializer(user.lists.all(), many=True).data # if len(user_lists) else []
    words = WordSerializer(user.words.all()[0:10], many=True).data
    return Response({
      "user": UserSerializer(user, context=self.get_serializer_context()).data,
      "token": token,
      "lists": lists,
      "words": words
    })


# Get User API
class UserAPI(generics.RetrieveAPIView):
    permission_classes = [
      permissions.IsAuthenticated,
      ]
    serializer_class = UserSerializer

    
    def get_object(self):
        return self.request.user
    def get(self, request, *args, **kwargs):
        user = self.request.user
        lists = ListSerializer(user.lists.all(), many=True).data
        words = WordSerializer(user.words.all()[0:10], many=True).data
        return Response({
          'user': UserSerializer(user, context=self.get_serializer_context()).data,
          "lists": lists,
          "words": words
        })