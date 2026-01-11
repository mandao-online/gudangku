<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUnitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // nama satuan (buah, pcs, kg, dll)
            $table->string('symbol')->nullable(); // simbol satuan (optional)
            $table->text('description')->nullable(); // deskripsi satuan
            $table->boolean('is_active')->default(true); // status aktif
            $table->softDeletes(); // soft delete
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('units');
    }
}
