<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // First, update any existing 'late' records to 'present'
        DB::table('attendance_records')
            ->where('status', 'late')
            ->update(['status' => 'present']);

        // Then modify the enum to remove 'late' option
        DB::statement("ALTER TABLE attendance_records MODIFY COLUMN status ENUM('present', 'absent') DEFAULT 'absent'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Restore the original enum with 'late' option
        DB::statement("ALTER TABLE attendance_records MODIFY COLUMN status ENUM('present', 'late', 'absent') DEFAULT 'absent'");
    }
};