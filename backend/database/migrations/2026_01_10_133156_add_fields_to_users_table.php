<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('position')->nullable()->after('email');
            $table->string('department')->nullable()->after('position');
            $table->string('phone')->nullable()->after('department');
            $table->string('avatar')->nullable()->after('phone');
            $table->enum('role', ['admin', 'staff', 'manager'])->default('staff')->after('avatar');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['position', 'department', 'phone', 'avatar', 'role', 'is_active']);
        });
    }
}
