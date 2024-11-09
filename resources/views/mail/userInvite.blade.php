<!DOCTYPE html>
<html>

<head>
    <title>Welcome to the Team</title>
</head>

<body>
    <h1>Hello, {{ $name }}!</h1>
    <p>We're excited to have you on board as {{ $role }}. Here are your login details:</p>
    <p>
        <strong>Email:</strong> {{ $email }}<br>
        <strong>Password:</strong> {{ $password }}
    </p>
    <p>
        Please click the link below to login and start exploring:<br>
        <a href="{{ $loginLink }}">{{ $loginLink }}</a>
    </p>
    <p>Welcome aboard!<br>The Team</p>
</body>

</html>
