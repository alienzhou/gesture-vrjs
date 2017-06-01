{% extends 'home:page/layout.tpl' %}

{% block css %}
    {% require "home:static/css/index.less" %}
    {% require "home:static/css/logo.less" %}
{% endblock %}

{% block script %}
    {% require "home:static/js/index.js" %}
{% endblock %}

{% block content %}
     <div id="pages-container">
        <div id="logo-container" class="logo_container clearfix"></div>
        {% widget "home:widget/message/message.tpl"%}
     </div>
{% endblock %}